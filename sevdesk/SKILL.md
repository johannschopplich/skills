---
name: sevdesk
description: Book, correct, or audit sevDesk vouchers through the API behind one approval tray.
argument-hint: "book <pdf…> | correct <voucher numbers> | audit <Qn YYYY | YYYY>"
disable-model-invocation: true
---

# sevDesk

Keep the books in sevDesk for a German freelancer who invoices German and foreign clients, sells through merchants of record, and buys software and gear abroad: SKR04, Ist-Versteuerung, no UStVA filed (Finanzamt exemption), the ZM filed quarterly, so every period of the open year is editable. Years whose annual return is filed (currently 2025 and earlier) are read-only history.

**Load the doctrine first: invoke the `push-right` skill.** Here the artifact is the sevDesk account, an applied change is a draft voucher, the gates are the reports, and shipping is finalizing and linking. The irreversible actions are **finalize**, **link a payment**, **correct a finalized voucher**, **delete**, and **tag**. `enshrine` (Festschreiben) never runs.

## API

Call `<this skill's directory>/scripts/sev.sh <METHOD> <path> [curl args…]` from the directory holding the human's `.env`. It reads `SEVDESK_API_KEY` from the environment or `./.env`; with neither, stop and ask the human for the token. The token stays out of output, files, and commands.

The spec is the reference for endpoints and fields: fetch `https://api.sevdesk.de/openapi.yaml` once per run into `$TMPDIR` and read the path's section. The tax rule table sits in `info.description`, a single line: `grep -o "'taxRule': 12.\{0,200\}"`. The spec leaves out what follows:

| Topic | Fact |
| --- | --- |
| Bookkeeping 2.0 | `taxRule` + `accountDatev` on every voucher and position; `taxType`, `taxSet`, `accountingType`, and `CreditNote/Factory/createFromVoucher` are dead. `GET /ReceiptGuidance/forAccountNumber?accountNumber=` maps an SKR04 number to its `accountDatev` id with its allowed rules and rates. |
| Reports | Undocumented, same figures as the UI. `GET /AccountingReports/ustva?startMonth=YYYY-MM&endMonth=YYYY-MM&taxationType=IST` takes a month, a quarter, or a whole year (other ranges answer 500); each KZ is a `fields[]` entry nested under `objects.categories` (`fieldNumber` like `"84 / 85"`, `taxableBaseAmountPrecise`, `taxAmountPrecise`, contributing documents in `objects[]`): collect them with `.. | objects | select(has("fieldNumber"))`. `/AccountingReports/balanceList?startDate=YYYY-MM&endDate=YYYY-MM` and `/AccountingReports/accountSheet?…&skr04AccountNumber=NNNN&sortColumn=date&sortDirection=ASC` return German-formatted strings (`"913,47 €"`, side `(S)`/`(H)`). |
| Periods | KZ 81 counts by payment date, input tax (KZ 66, 67, and §13b) by `voucherDate`, accounts post by `deliveryDate`. A voucher date in the wrong quarter moves its tax there. KZ 21 and the ZM follow the service period (§ 18b UStG): an EU invoice paid in a later quarter than its service is a Decision. |
| Lists | Filter server-side: `status=` on `/Voucher`, `/CheckAccountTransaction`, and `/Invoice`, `descriptionLike=` on `/Voucher`, `startDate`/`endDate` as Unix timestamps. Send `countAll=true` and page with `offset` when `total` exceeds the `limit`. Bank row status 100 is unlinked. |
| Documents | `GET /Document/{voucher.document.id}/download` returns the file as base64 in `objects.content`. Upload: `POST /Voucher/Factory/uploadTempFile` (multipart `file=@x.pdf;type=application/pdf`) → `objects.filename` into `saveVoucher`. |
| Save | `saveVoucher` creates with the `status` it is sent – before the checkpoint always `status: 50` – and takes its payload shape from the spec's example; JSON bodies need `-H 'Content-Type: application/json'`. With `voucher.id` it updates that draft, and drafts only: a position carrying its `id` is updated, one without is added, `voucherPosDelete: [{id, objectName: "VoucherPos"}]` removes one, and `voucherPosSave: null` with `filename: null` keeps positions and document. Finalizing is that update with `status: 100`. A finalized voucher changes through `PUT /Voucher/{id}/resetToOpen` (unlinks its payments) → `resetToDraft` → update → finalize → re-link. |
| Payment | `PUT /Voucher/{id}/bookAmount` with `amount`, `date` (the bank row's `valueDate`), `type` (`FULL_PAYMENT`, or `N` for each partial row before the last), `checkAccount`, `checkAccountTransaction`, `createFeed: true`. `amount` carries the bank row's sign: negative for an expense (`C`), positive for a revenue (`D`). Existing links: `GET /CheckAccountTransactionLog?checkAccountTransaction[id]=…&checkAccountTransaction[objectName]=CheckAccountTransaction`, the voucher in `object`, the amount in `amountPaid`. |
| Foreign currency | `sum*ForeignCurrency` is the document amount, `sum*` EUR at the document rate, `sum*Accounting` EUR as paid. |
| Tags | Create: `POST /Tag/Factory/create` with `{name, object: {id, objectName}}` (Voucher or Invoice). Read: `GET /TagRelation`. |

Not yet proven through the API, so each is a Decision: creating a foreign-currency voucher, a payment whose amount differs from the voucher (fees, FX), and goods bought from an EU seller.

## Boundary Marker

The **sevDesk account is the state**. The delta: unlinked bank rows, draft and open vouchers, invoice drafts. The tag `akzeptiert` marks a deviation the human accepted, never one that changes the year's tax: it reports under Accepted, and its amounts leave the account checks. A bank fee row waits for its bank's monthly fee invoice: it reports as waiting until that invoice is due, then as a failure.

## Booking Rules

**The supplier's last finalized voucher is the precedent**, unless tagged `akzeptiert`: its account and rule carry over. Supplier names vary in spelling across vouchers; match them loosely. A new supplier's expense account follows the line item: 6837 software, hosting, domains and licences; 6821 courses and conference tickets; 6820 books, magazines and paid newsletters; 6845 tools and small devices up to 250 € net – a device above that is an asset (GWG up to 800 € net, AfA beyond; position flags `isAsset`/`isGwg`, no ReceiptGuidance for 0670), not yet proven through the API, so a Decision; 6850 Sonstiger Betriebsbedarf; 6815 Bürobedarf, consumables only; 6855 bank and FX fees.

Purchases, first matching row wins:

| Document | `taxRule`, rate | UStVA |
| --- | --- | --- |
| Imported physical goods (customs apply) | 9, 0 % | – |
| Marketplace receipt (Amazon EU) printing German 19 % for a foreign seller, up to 250 € gross or showing the seller's `DE` USt-IdNr.; otherwise a Decision | 9, 19 % → Vorsteuer 1406 | KZ 66 |
| `DE` USt-IdNr. or German Steuernummer, 19 % printed; or a Kleinbetragsrechnung up to 250 € gross with 19 % printed | 9, 19 % → Vorsteuer 1406 | KZ 66 |
| EU member prefix (`AT`, `FR`, `NL`, …), services | 14 (§13b Abs. 1 EU), 0 % | KZ 46/47, offset on 1407 |
| `EU` (non-Union OSS), `GB`, `US`, or none | 12 (§13b Abs. 2 mit Vorsteuerabzug), 0 % | KZ 84/85, offset on 1407 |

Sales:

| Client | Booking | UStVA |
| --- | --- | --- |
| German client | invoice on 4400, `taxRule` 1, 19 % | KZ 81 |
| EU business with USt-IdNr. | invoice on 4336, `taxRule` 21, printing "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)" | KZ 21, plus ZM |
| Business outside the EU, or an `EU`-prefixed party | invoice on 4338, `taxRule` 17 | KZ 45 |
| Merchant-of-record payout (Paddle, Lemon Squeezy) | revenue voucher on 4338, `taxRule` 17 | KZ 45 |

- **At 0 % the gross is the document total**: any "VAT" or "Tax" a foreign supplier printed is cost.
- `voucherDate`, `deliveryDate`, and `paymentDeadline` take the document date, `description` the invoice number, `supplierName` the supplier as free text (`supplier: null`).
- 4200 accepts most rules, so a wrong one saves silently: payouts go on 4338.
- A bank that invoices its fees gets a voucher on 6855, linked to the fee rows it covers: a reverse-charge note takes the rule its prefix picks, a printed VAT exemption takes rule 9 at 0 %, neither note is a Decision.
- **Imports**: the courier's invoice carries customs duty on 5840 at 0 %, import VAT (EUSt) on 1433 at 0 % (KZ 62), and its own fee (Auslagenpauschale, Vorlageprovision) on 5840 at the printed rate.
- **Privately paid**: a reimbursement transfer in the same month, naming the receipt and matching its amount, links to the voucher as its payment. A later, partial, or collective reimbursement, or none by year-end, is a Decision recommending payment via 2180 Privateinlagen on the private payment date and the transfer on 2100.
- **Refund without credit note** (§ 17 UStG: bank row plus return confirmation suffice): the original voucher stays as invoiced, linked to the charge. A revenue voucher (`creditDebit: "D"`) with the original's `accountDatev`, `taxRule`, and rate, one position per returned item, the return confirmation attached, links to each refund row. Negative positions on the original book the refunds as payments and leave 3300 off by the refunded sum.

## Apply vs Propose

**Apply** – a draft (status 50) with its document attached, wherever the precedent or the purchase table gives the document a single form and, once paid, a bank row matches its amount exactly.

**Propose** where a choice exists: a document that departs from its precedent, an amount difference, a refund, a document dated in a filed year, anything on the not-yet-proven list, and every correction of a finalized voucher.

## Run – in Order

1. **Resolve the unit.** `book`: the given PDFs. `correct`: the vouchers named by `id` or invoice number; a number matching several is a Decision. `audit`: the quarter or year, marked running if it has not ended.
2. **Capture the baseline**: `ustva` for the quarter of every document and payment date involved, `balanceList` for the year.
3. **Read the delta** (Boundary Marker).
4. **Work the mode.**
   - `book`: read each document, look for its voucher by invoice number in `description` (open or paid: already booked, list it and stage nothing; a draft: re-present it), match its bank row, read the precedent (`getPositions?embed=accountDatev`), resolve `accountDatev` via ReceiptGuidance, then draft or propose. Done when every PDF is listed as booked, a Decision, or a draft whose `GET /Voucher/{id}` and `getPositions` match the document (sum, `taxRule` within ReceiptGuidance's allowed rules, accounts, rates) while `ustva` still equals the baseline. A draft that cannot be made to match becomes a Decision, its deletion on the tray.
   - `correct`: read the voucher, positions (`?embed=accountDatev`), payment logs, and document. The target is what the Booking Rules give for that document; stage it as one tray item with its full payload chain.
   - `audit`: run every check below. Done when each is pass, fail, waiting, or accepted with its figures, and every fail traces to the vouchers causing it, each with a `correct` item or a Decision.
5. **Write the expected deltas** for every tray item: the accounts and KZ it moves, and by how much.
6. **Assemble the brief and present it at the checkpoint.**

Audit checks for the unit:

- Every voucher on the 1406 account sheet shows the supplier's `DE` USt-IdNr. or German Steuernummer (documents also print the buyer's own), or is a Kleinbetragsrechnung or a refund voucher.
- 1407 and 3837 carry the same amount; KZ 46/47 documents trace to EU-member suppliers, KZ 84/85 to `EU`-OSS and non-EU suppliers.
- 4200 carries no balance. KZ 60 is 0. KZ 81 traces to 4400, KZ 21 to 4336, KZ 45 to 4338. Each KZ 21 invoice is listed with its service quarter as the ZM reminder.
- 3300 is 0 for the year, or equals the open expense vouchers.
- No bank row in the unit has status 100, no draft or open voucher is left unlisted, and every array under `ustva` `failures` is empty.
- No voucher departs from its supplier's precedent, and no voucher date sits in another quarter than its document date.

## The Brief

Rendered in the conversation's language.

```
## sevDesk · <mode> · <unit>
state: <N> unlinked bank rows · <D> drafts · <O> open vouchers · baseline <timestamp>

### Checks                ← audit only
| Check | Result | Figures |

### Decisions             ← judgment calls only
1. <voucher / bank row>: <question>. Rec: <answer> + <one-line why>. [document]

### Applied (drafts, nothing booked)
- <supplier> <number> · <sum> · <account> · rule <taxRule> · draft <id>   ✅ verified

### Accepted (tagged `akzeptiert`)
- <voucher> · <deviation>

### Expected deltas
| Item | Account / KZ | Delta |

### Ready to ship – pick what books
[ ] finalize <N> drafts   [ ] link <N> payments   [ ] correct <voucher> [show payload]
[ ] tag <voucher> `akzeptiert`   [ ] delete draft <id>
```

Offer `tag` for a Decision whose recommendation is to accept the deviation, `delete` for a duplicate or failed draft this run created.

## After Approval

Safe order: delete → correct → finalize → link → tag. A `correct` item runs its whole chain; on a failure mid-chain, re-save the payload read before the reset, finalize, re-link, and report the item as failed. Before each item, re-check that the voucher's `update` timestamp and the bank rows' status still match the brief. Then read `ustva` and `balanceList` again: every account and KZ moves exactly by its expected delta and nothing else moves. An unexpected delta is a failed item, reported with both figures.

---
name: sevdesk
description: Book, correct, or audit sevDesk vouchers through the API behind one approval tray.
argument-hint: "book <pdf…> | correct <voucher numbers> | audit <Qn YYYY | YYYY>"
disable-model-invocation: true
---

# sevDesk

Keep the books in sevDesk for a German Freiberufler (§ 18 EStG): SKR04, Ist-Versteuerung, no UStVA filed (Finanzamt exemption), the ZM filed quarterly, so every period of the open year is editable. Years whose annual return is filed (currently 2025 and earlier) are read-only history.

**Load the doctrine first: invoke the `push-right` skill.** Here the gates are the reports. The irreversible actions are **finalize**, **link a payment**, **correct a finalized voucher**, **delete**, and **tag**. `enshrine` (Festschreiben) never runs.

## API

Call `<this skill's directory>/scripts/sev.sh <METHOD> <path> [curl args…]` from the directory holding the human's `.env`. With no key, ask the human for the token. The token stays out of output, files, and commands.

The spec is the reference for endpoints and fields: fetch `https://api.sevdesk.de/openapi.yaml` once per run into `$TMPDIR` and read the path's section. The tax rule table sits in `info.description`, a single line: `grep -o "'taxRule': 12.\{0,200\}"`. The spec leaves out what follows:

| Topic | Fact |
| --- | --- |
| Bookkeeping 2.0 | `taxRule` + `accountDatev` on every voucher and position; `taxType` and `taxSet` are dead. `GET /ReceiptGuidance/forAccountNumber?accountNumber=` resolves an SKR04 number. |
| Reports | `GET /AccountingReports/ustva?startMonth=YYYY-MM&endMonth=YYYY-MM&taxationType=IST` takes a month, a quarter, or a whole year (other ranges answer 500); each KZ is a nested object (`fieldNumber` like `"84 / 85"`, `taxableBaseAmountPrecise`, `taxAmountPrecise`, contributing documents in `objects[]`): collect them with `.. | objects | select(has("fieldNumber"))`. `/AccountingReports/balanceList?startDate=YYYY-MM&endDate=YYYY-MM` and `/AccountingReports/accountSheet?…&skr04AccountNumber=NNNN&sortColumn=date&sortDirection=ASC` return German-formatted strings (`"913,47 €"`, side `(S)`/`(H)`). |
| Periods | KZ 81 counts by payment date, input tax (KZ 66, 67, and §13b) by `voucherDate`, accounts post by `deliveryDate`. KZ 21 and the ZM follow the service period (§ 18b UStG): an EU invoice paid in a later quarter than its service is a Decision. |
| Lists | `status=` also filters `/CheckAccountTransaction`; `startDate`/`endDate` take Unix timestamps. Send `countAll=true` and page with `offset` when `total` exceeds the `limit`. `GET /VoucherPos?embed=accountDatev` returns every position in one call, keyed by `voucher.id`. |
| Documents | `GET /Document/{voucher.document.id}/download` returns the file as base64 in `objects.content`. Upload: `POST /Voucher/Factory/uploadTempFile` (multipart `file=@x.pdf;type=application/pdf`). |
| Save | `saveVoucher` creates with the `status` it is sent; JSON bodies need `-H 'Content-Type: application/json'`. With `voucher.id` it updates that draft: a position carrying its `id` is updated, one without is added, `voucherPosDelete: [{id, objectName: "VoucherPos"}]` removes one, and `voucherPosSave: null` with `filename: null` keeps positions and document. Finalizing is that update with `status: 100`. A finalized voucher changes through `PUT /Voucher/{id}/resetToOpen` → `resetToDraft` → update → finalize → re-link. |
| Payment | `PUT /Voucher/{id}/bookAmount` with `date` the bank row's `valueDate`, `type` `FULL_PAYMENT` (`N` for each partial row before the last), and `createFeed: true`. `amount` carries the bank row's sign: negative for an expense (`C`), positive for a revenue (`D`). Existing links: one `GET /CheckAccountTransactionLog?limit=1000&countAll=true`, mapped locally by `checkAccountTransaction` and `object` (the voucher), the amount in `amountPaid`; a filter by `object` is silently ignored. |
| Foreign currency | `sum*ForeignCurrency` is the document amount, `sum*` EUR at the document rate, `sum*Accounting` EUR as paid. Positions are sent in document currency. Every `resetToOpen` and `resetToDraft` converts the stored EUR sums again: after a reset, re-save each position by `id` with its document-currency amount and check `sumGrossForeignCurrency` before finalizing. A payment that differs from `sumGross` links with `type: "MTC"`, the difference landing on 6855 (`FULL_PAYMENT` and `CF` answer 422, `O` books it against the expense account). |

Not yet proven through the API, so each is a Decision: creating a foreign-currency voucher, goods bought from an EU seller, and an asset – a durable item above 250 € net, import duty and courier fee included (GWG up to 800 € net if self-contained, otherwise AfA).

## Boundary Marker

The **sevDesk account is the state**. The delta: unlinked bank rows, draft and open vouchers, invoice drafts, and the `akzeptiert` tags (`GET /TagRelation`). The tag `akzeptiert` marks a deviation the human accepted: it reports under Accepted, and its amounts leave the account checks. A bank fee row waits for its bank's monthly fee invoice: it reports as waiting until the 5th of the following month, then as a failure.

## Booking Rules

**The supplier's last finalized voucher is the precedent**, unless tagged `akzeptiert`: its account and rule carry over (supplier names matched loosely). A new supplier's expense account follows the line item: 6837 software, hosting, domains and licences; 6821 courses and conference tickets; 6820 books, magazines and paid newsletters; 6845 tools, accessories, and small devices up to 250 € net per item; 6850 Sonstiger Betriebsbedarf; 6815 Bürobedarf, consumables only; 6855 bank and FX fees.

Purchases, first matching row wins:

| Document | `taxRule`, rate | UStVA |
| --- | --- | --- |
| Imported physical goods (customs apply) | 9, 0 % | – |
| German 19 % printed with the seller's `DE` USt-IdNr. or German Steuernummer, or up to 250 € gross (Kleinbetragsrechnung); 19 % printed otherwise (Amazon EU for a foreign seller) is a Decision | 9, 19 % → Vorsteuer 1406 | KZ 66 |
| Event admission, hotel, or property service abroad (taxed where it takes place, § 3a Abs. 3 UStG) | a Decision | – |
| EU member prefix (`AT`, `FR`, `NL`, …), services | 14 (§13b Abs. 1 EU), 0 % | KZ 46/47, offset on 1407 |
| `EU` (non-Union OSS), `GB`, `US`, or a foreign address with no number, services | 12 (§13b Abs. 2 mit Vorsteuerabzug), 0 % | KZ 84/85, offset on 1407 |

Sales:

| Client | Booking | UStVA |
| --- | --- | --- |
| German client | invoice on 4400, `taxRule` 1, 19 % | KZ 81 |
| EU business with USt-IdNr. | invoice on 4336, `taxRule` 21 | KZ 21, plus ZM |
| Business outside the EU, an `EU`-prefixed party, or a merchant-of-record payout (Paddle, Lemon Squeezy; as a revenue voucher) | 4338, `taxRule` 17 | KZ 45 |

- **At 0 % the gross is the document total**: any "VAT" or "Tax" a foreign supplier printed is cost.
- `voucherDate`, `deliveryDate`, and `paymentDeadline` take the document date, `description` the invoice number, `supplierName` the supplier as free text (`supplier: null`).
- A bank that invoices its fees gets a voucher on 6855, linked to the fee rows it covers: a reverse-charge note takes the rule its prefix picks, a printed VAT exemption takes rule 9 at 0 %, neither note is a Decision.
- **Imports**: the courier's invoice carries customs duty on 5840 at 0 %, import VAT (EUSt) on 1433 at 0 % (KZ 62), and its own fee (Auslagenpauschale, Vorlageprovision) on 5840 at the printed rate.
- **Privately paid**: a reimbursement transfer in the same month, naming the receipt and matching its amount, links to the voucher as its payment. A later, partial, or collective reimbursement, or none by year-end, is a Decision recommending payment via 2180 Privateinlagen on the private payment date and the transfer on 2100.
- **Refund without credit note** (§ 17 UStG): the original voucher stays as invoiced, linked to the charge. A revenue voucher (`creditDebit: "D"`) with the original's `accountDatev`, `taxRule`, and rate, one position per returned item, the return confirmation attached, links to each refund row.

## Apply vs Propose

**Apply** – a draft (status 50) with its document attached, wherever the precedent or the purchase table gives the document a single form and, once paid, a bank row matches its amount: exactly in EUR, within the card's FX difference for a foreign-currency document.

**Propose** where a choice exists: a document that departs from its precedent, an amount difference outside FX, a refund, a document dated in a filed year, anything on the not-yet-proven list, and every correction of a finalized voucher.

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
- 1407 and 3837 carry the same amount, and each KZ traces to its row in the Booking Rules tables.
- 4200 carries no balance. KZ 60 is 0. Each KZ 21 invoice is listed with its service quarter as the ZM reminder.
- The year's tax payable is reported against the 2 000 € line above which Voranmeldungen resume the next year (§ 18 Abs. 2 UStG).
- 3300 is 0 for the year, or equals the open expense vouchers.
- No bank row in the unit has status 100, no draft or open voucher is left unlisted, and every array under `ustva` `failures` is empty.
- No voucher departs from the purchase table or from its supplier's other vouchers in the unit, and no voucher dated in the first or last two weeks of the year sits in another year than its document.
- Every bank row marked private (status 300) whose payee is a business or an authority is listed in the check's figures, as information.

## The Brief

Rendered in German.

```
## sevDesk · <mode> · <unit>
state: <N> unlinked bank rows · <D> drafts · <O> open vouchers · baseline <timestamp>

### Checks                ← audit only
| Check | Result | Figures |

### Decisions
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

Offer `tag` for a Decision whose recommendation is to accept a deviation that leaves the year's tax payable unchanged, `delete` for a duplicate or failed draft this run created.

## After Approval

Safe order: delete → correct → finalize → link → tag. A `correct` item runs its whole chain; on a failure mid-chain, re-save the payload read before the reset, finalize, re-link, and report the item as failed. Before each item, re-check that the voucher's `update` timestamp and the bank rows' status still match the brief. Then read `ustva` and `balanceList` again: every account and KZ moves exactly by its expected delta and nothing else moves. An unexpected delta is a failed item, reported with both figures.

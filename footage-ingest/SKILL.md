---
name: footage-ingest
description: Ingest a camera card into a multi-drive footage archive, orphans first and every copy gated before the run is called done.
argument-hint: "nothing (detect the mounted card), or a card mount path"
disable-model-invocation: true
---

# Footage Ingest

Get every clip off the card and onto every archive drive it belongs on.

**Measure, never recall.** Mount names, filesystems, free space, and the folder convention come from the filesystem on every run. Where a session log or past write-up and the disks disagree, the disks win.

## Inventory

Reach a state where **every clip on the card is accounted for, per destination drive, in exactly one bucket**: already archived there, queued to copy there, or discarded by name.

- **Name-match → verify by size.** Two camera bodies share a counter range, so a size mismatch on a name-match is a collision, not a duplicate.
- **Mixed shoot day** – read the camera model from each day's XML sidecars, per day. Two models → camera subfolders; one → none.
- **Free space** – sum the bytes actually queued per destination against each drive's free space before proposing anything.

## Orphans

An **orphan** exists in exactly one place. Once the decisions are settled, copy orphans to every drive first, then the rest of the queue. Two hiding places:

- **Gaps in the clip counter.** Cameras number clips consecutively across shoot days, so a jump on the card (`C0531, C0533` then `C0623`) means clips were deleted from it. If those numbers turn up in a staging folder on an internal disk, that folder holds the only copy.
- **Curated staging folders.** Material already pulled to an internal disk and culled by hand carries the user's keep/discard decision. Take those days from the staging folder and exclude them from the card pass entirely.

XML sidecars deleted alongside culled clips are gone; say so.

## Settle the Decisions

Ingest decisions are the user's: which folder tree, whether XML sidecars and stills come along, what happens to culled clips, whether a nearly-full working drive gets this batch.

Invoke the `grilling` skill (fallback: ask in rounds, waiting for each), every question carrying your recommendation and built from an inventory finding – an orphan, a collision, a drive that ends the run at 8% free. Done when **every decision the inventory surfaced has an answer you did not supply**.

## Copy

```
/opt/homebrew/bin/rsync -rt --modify-window=2 --partial-dir=.rsync-partial \
  --exclude='._*' --exclude='.DS_Store' \
  --include='<day-prefix>*.MP4' --exclude='*' \
  "<source clip folder>/" "<destination day folder>/"
```

- **Homebrew rsync 3.x** – macOS ships openrsync (2.6.9-compatible).
- **`-rt`, not `-a`** – exFAT has no POSIX owners, permissions, or symlinks.
- **`--modify-window=2`** – exFAT timestamps are 2-second granular; without it every rerun re-copies the APFS-sourced set.
- **`--partial-dir`, not `--partial`** – an interrupted transfer never leaves a truncated file under the real name.
- **Counter-named clips** (`C0531.MP4`) – no prefix selects a day, so write that day's bare file names to a list and pass `--files-from=<list>` in place of the `--include`/`--exclude='*'` pair.
- **Sidecars** the user chose – their own `--include` before `--exclude='*'` (first match wins), or their own lines in the list.
- **One flat folder per stage** – `--exclude='*'` blocks recursion. Stills live in a separate card folder (`DCIM` on Sony), so they are their own stage.

Run each stage in the background with output logged and wait for its exit status; a card copy outlasts the foreground timeout. A copy in progress is not a stopping point: keep going until the gate passes or a stage fails.

**Additive only.** `--delete` belongs in no invocation: archive drives hold deliberate subsets of each other. Deletion is a separate operation, dry-run first, on files the user named.

**Source → each destination**, never archive drive to archive drive, so a silent read error can't propagate into every copy.

## Gate

Done when, for **every** destination folder, file count and summed bytes match the source files queued for it exactly, no `.rsync-partial` remains, and every rsync stage exited 0. Report per folder; a total hides a folder that gained and another that lost.

**Count only the payload extension.** macOS's exFAT driver writes a 4 KiB `._` AppleDouble file for every file created; no flag prevents it (`COPYFILE_DISABLE=1`, `--no-xattrs`, `cp`, and shell redirects all produce it). An unfiltered sum fails by exactly 4096 per file – not data loss. Leave them; the next write recreates them.

**Verify against the source on disk, not the log.** Exit 0 says the command ran, not that the bytes arrived.

Silent false failures:

- Mount paths contain spaces (`/Volumes/LaCie 5TB`): quote every expansion.
- zsh doesn't word-split unquoted parameters: build lists as arrays (`DIRS=( … )`, `"${DIRS[@]}"`), or the loop runs zero times and every folder reports empty.

## Close Out

Write a protocol next to the previous ones, matching their format and length: starting state, decisions with their reasoning, commands run, gate results with real numbers, ending free space, and open items.

Leave the card mounted and unformatted until the user has reviewed the footage – culled clips still live only there. Formatting happens in the camera, which keeps the vendor folder structure.

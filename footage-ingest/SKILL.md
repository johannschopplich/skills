---
name: footage-ingest
description: Ingest a camera card into a multi-drive footage archive, orphans first and every copy gated before the run is called done.
argument-hint: "nothing (detect the mounted card), or a card mount path"
disable-model-invocation: true
---

# Footage Ingest

Get every clip off the card and onto every archive drive it belongs on, under the human's decisions rather than your own.

**Measure, never recall.** Mount names, filesystems, free space, and the folder convention come from the filesystem on every run. A drive that was there last time may be absent, renamed, full, or swapped for a different one, and a session log describing the archive is weaker evidence than the archive itself. Where a past write-up and the disks disagree, the disks win.

## Inventory

Reach a state where **every clip on the card is accounted for in exactly one bucket**: already archived, queued to copy, or discarded by name.

Diff card against archive by basename, then **verify every name-match by size**. Two camera bodies in one kit share a counter range, so identical names can be different footage. A size mismatch on a name-match is a collision, not a duplicate, and silently skipping it loses a clip.

Read the camera model from each day's XML sidecars. A day with two models is a **mixed shoot day** and needs camera subfolders; a day with one does not. The answer changes per day, so check per day.

Sum the bytes actually queued, per destination, and compare against each drive's free space before proposing anything.

## Orphans

An **orphan** is material that exists in exactly one place: the only state where a single failure loses footage for good. Copy orphans to every drive before copying anything else, then continue with the rest of the queue.

Two hiding places, both visible only once the inventory diff exists:

- **Gaps in the clip counter.** Cameras number clips consecutively across shoot days. A jump in the sequence on the card (`C0531, C0533` then `C0623`) means clips were deleted from it. If those numbers turn up in a staging folder on an internal disk, that folder holds the only copy in existence, and the card cannot tell you, because the evidence is what is *missing* from it.
- **Curated staging folders.** Material already pulled to an internal disk and culled by hand is authoritative for those days: it carries the human's keep/discard decision, which the card does not. Take those days from the staging folder and exclude them from the card pass entirely, rather than copying the card's version and subtracting.

XML sidecars deleted alongside culled clips are gone. Say so plainly rather than reconstructing them: synthesized metadata is worse than absent metadata.

## Settle the decisions

Ingest decisions are the human's: which folder tree the material belongs in, whether XML sidecars and stills come along, what happens to clips they culled, whether a nearly-full working drive gets this batch.

Interview them in rounds, every question carrying your recommended answer, until **every decision the inventory surfaced has an answer you did not supply**. The `grilling` skill runs this interview; without it, ask in rounds and wait for each round before the next.

Findings from the inventory are what the questions are built from: an orphan, a collision, a drive that ends the run at 8% free.

## Copy

```
rsync -rt --modify-window=2 --partial-dir=.rsync-partial \
  --exclude='._*' --exclude='.DS_Store' --include='<date>_*.MP4' --exclude='*'
```

Use Homebrew's rsync explicitly (`/opt/homebrew/bin/rsync`); macOS ships 2.6.9, which lacks most of this.

- **`-rt`, not `-a`**: exFAT has no POSIX owners, permissions, or symlinks, so `-a` only generates errors.
- **`--modify-window=2`**: exFAT timestamps are 2-second granular, APFS is nanosecond. Without it, every rerun re-copies the whole APFS-sourced set.
- **`--partial-dir`, not `--partial`**: an interrupted transfer leaves a fragment under the temp name, never a truncated file wearing the real one.

**Every sync is additive: rsync only creates and copies here.** Deletion is a separate operation, dry-run first, on files the human named. `--delete` belongs in no invocation, because archive drives routinely hold deliberate subsets of each other and mirroring semantics destroy material that is missing on purpose.

Read the card once per destination rather than copying drive-to-drive. A silent read error on a card-to-drive hop otherwise propagates the same corruption into every copy.

## Gate

The run is done when, for **every** destination folder, file count and summed bytes match the source exactly, no `.rsync-partial` remains, and every rsync stage exited 0. Report per folder; a total alone hides a folder that gained and another that lost.

**Count only the payload extension.** macOS writes a 4 KiB `._` AppleDouble file for every file created on exFAT. The driver does it, not rsync, and no flag prevents it: `COPYFILE_DISABLE=1`, `--no-xattrs`, plain `cp`, and a bare shell redirect all produce it. An unfiltered byte sum therefore fails by exactly 4096 per file, which reads like data loss and is not. Leave the AppleDouble files in place, since deleting them is undone by the next write.

**Verify against the source on disk, not the log.** Logs live in `/tmp` and vanish on reboot, and a stage exiting 0 says the command ran, not that the bytes arrived.

Two shell traps produce false gate failures, both silent:

- Mount paths contain spaces (`/Volumes/LaCie 5TB`). Quote every expansion; `ls … | xargs basename` splits the path and reports nonsense.
- zsh does not word-split unquoted parameters. Build lists as arrays (`DIRS=( … )`, `"${DIRS[@]}"`), or a loop silently runs zero times and every folder reports empty.

## Close out

Write a protocol next to the previous ones: starting state, decisions with their reasoning, commands run, gate results with real numbers, ending free space, and open items. The reasoning is the part no one can reconstruct later from the filesystem.

Leave the card mounted and unformatted until the human has reviewed the footage, since clips they culled still live only there. Formatting happens in the camera, which keeps the vendor folder structure intact.

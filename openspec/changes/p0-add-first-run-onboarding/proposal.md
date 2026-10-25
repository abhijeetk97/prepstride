## Why
The review found the first open is a scoreboard for a day that has not happened: rank "The Novice", shields 0/3, six rituals, ring 0m of 8h — and about six seconds later the "Take PrepStride offline" sheet covers it all. Identity is placeholder ("Champion" / "Partner"), the default target is an 8-hour day, and a new user cannot tell what to do in 60 seconds. The treat-box copy is also hardcoded to "her favorite dinner" / "Treat herself on his tab" and ignores whatever names are set.

## What Changes
- A skippable **first-run wizard** (≤ 3 screens, shown once, re-openable from Settings):
  1. **Names** — her name + partner name; used everywhere: Home header, share card, treat box, rank labels.
  2. **Optional subject** — pick a template (`src/data/optionals.ts`) or "Decide later".
  3. **Daily target** — humane presets 2 / 3 / 4 / 6 h, default **4h** (changeable any time in Settings).
- The **install prompt** (`src/components/pwa/InstallPrompt.tsx`) waits until onboarding is complete **and** the user has ≥ 2 distinct study days; the existing weekly re-offer logic applies after that.
- **Empty Home**: one primary action ("Log your first session"), a one-line explanation of rituals; the rank/shield wall appears only after first data exists.

## Capability Impact
- `onboarding`: ADDS requirements (wizard, install-prompt gating, empty Home).
- Interacts with `p0-fix-streak-and-day-target` (target default 4h comes from there) and `p1-improve-home-surface` (share-card naming).

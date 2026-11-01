## 1. Foundation
- [x] Tokens, keyframes and tiers in `src/styles/motion.css`; imported from `main.tsx`.
- [x] `useMotionPreference` + `settings.motion` (optional field); Settings → Motion.
- [x] Pause animations while `document.hidden`.

## 2. Pip
- [x] SVG rig in `components/mascot/Pip.tsx`, same props as before.
- [x] Five poses; SVG rank accessories; blink jitter per instance.
- [x] Single Pip on Home (none inside the ring).

## 3. Home and celebration
- [x] `SegmentedRing`, `CountUp`, stagger, L2 hero, time-of-day wash.
- [x] `claimDailyCelebration` replaces the ad-hoc guard; confetti removed from ritual taps and Rewards.
- [x] Tests: `src/utils/motion.test.ts` (count-up lands exactly, celebration once a day, ring segments).

## 4. Navigation, sheets, zen, reveals
- [x] View Transitions in `App.navigate`; nav pill.
- [x] Sheet exit + drag-to-dismiss in `Modal`.
- [x] Zen halo, cue, phase arc, `RollingDigits`, drift, wake lock.
- [x] Heatmap wave, flame tiers, shield fill, toast countdown, syllabus chip morph.

## 4b. Finishing pass
- [x] Quick log save flight: subject chip pop, sliding duration highlight, Save turns into a check, the new row grows into Home and the timesheet with a highlight, totals count up.
- [x] Delete collapses the row; Undo grows it back. The toast pauses while held; Calm shows the seconds left as text.
- [x] Haptics: 12ms pulse on save, daily target and a new shield (Android only), with a Settings switch.
- [x] Ritual tick floats the real XP (+25) and rolls the counter.
- [x] Home arrival plays on the first visit of the day or after 30 minutes away; plain tab switches skip it (tested).
- [x] Tabs slide in from the direction of travel; the active icon dips; browser back resets scroll.
- [x] Flame tiers 0 / 1–2 / 3–6 / 7+ with glow; "Start today" at 0; the shield pops with sparks when earned.
- [x] Heatmap: fixed readout slot, today pulse, wave once per session, opens on today.
- [x] Syllabus: seven-step revision track with a 30ms ripple.
- [x] Pip's accessory drops in once per new rank (tested), not on every render.
- [x] Sheet: 480ms in / 260ms out, blurred backdrop, dismiss past 30% height or 0.5 px/ms.

## 5. Visual refresh
- [x] Bricolage Grotesque 800 (Latin, self-hosted, precached).
- [x] Drawn icons for streak, rank, shields, target; emoji removed from UI labels.
- [x] `EmptyState` shows a Pip pose.

## 6. Verify
- [x] `npm run typecheck`, `npm test`, `npm run build` pass; JS +7 KB gzipped.
- [x] Checked at 375px: Home (first run and 4 subjects), target-met celebration, zen timer, Rewards, Settings in Midnight.

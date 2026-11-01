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

## 5. Visual refresh
- [x] Bricolage Grotesque 800 (Latin, self-hosted, precached).
- [x] Drawn icons for streak, rank, shields, target; emoji removed from UI labels.
- [x] `EmptyState` shows a Pip pose.

## 6. Verify
- [x] `npm run typecheck`, `npm test`, `npm run build` pass; JS +7 KB gzipped.
- [x] Checked at 375px: Home (first run and 4 subjects), target-met celebration, zen timer, Rewards, Settings in Midnight.

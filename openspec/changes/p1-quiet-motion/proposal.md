## Why
From the visual review (`docs/quiet-motion-prd.html`): Pip was a circle-cropped PNG with emoji stickers for moods, confetti re-fired on every ritual tap once the target was met, the app ignored reduced motion, and every card sat at the same elevation with emoji standing in for icons. The app felt flat where effort should feel seen, and noisy where it should stay calm.

## What Changes
- **Motion foundation:** duration and easing tokens plus three tiers (Full, Calm, Off) in `src/styles/motion.css`. `useMotionPreference` writes `<html data-motion>`. Settings → Motion offers System / Full / Calm / Off (`settings.motion`, optional so old backups restore). OS reduced motion picks Calm under System. All CSS animation pauses while the app is hidden.
- **Pip vector rig:** `Pip.tsx` is an inline SVG redrawn from the official artwork (hair, lashes, open beak, scalloped collar, rainbow wing feathers). Poses: cheer (breathe + blink), wave, focus (spectacles, slow), sleep (closed eyes, z's), celebrate (flap + hop). Rank accessories are SVG parts in place of emoji. One Pip on Home.
- **Home arrival:** subject-segmented ring (`SegmentedRing`) in `SUBJECT_META` colours, `CountUp` for today's minutes, 60 ms stagger, L2 hero card, time-of-day header wash, Bricolage Grotesque for hero numbers and titles.
- **Quiet celebration:** `ConfettiBurst` removed. The target-met moment (ring glow, Pip flap and hop, wing-colour feathers) fires at most once a day via `claimDailyCelebration`. Ritual checks draw in.
- **Navigation and sheets:** View Transitions for screen changes, sliding nav pill, `Modal` becomes a bottom sheet with exit animation and drag-to-dismiss.
- **Zen ambience:** breathing halo, breath cue, Pomodoro phase arc, rolling digits, slow colour drift, screen wake lock while running.
- **Data reveals:** heatmap wave, streak flame tiers, shield fill, undo countdown bar on toasts, syllabus status chip morph.
- **Visual refresh:** drawn icons replace emoji used as UI icons; empty states show a Pip pose; theme picker shows colour swatches.

## Not in this change
- Save flight from the Quick log sheet into the timesheet (M5 detail).
- Haptics and sound.

## Capability Impact
- `motion`: ADDS requirements (tiers, exact numbers, once-a-day celebration, hidden pause).

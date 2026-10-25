## 1. Wizard
- [x] New `OnboardingModal` (or 3-step sheet in `src/components/`): names → optional → target; "Skip" records defaults (names blank = keep current labels; optional deferred; target 4h).
- [x] Persist `onboardedAt` in settings (`src/db/index.ts` settings record or Dexie key); never re-show automatically; "Run setup again" entry in Settings.
- [x] Names feed every copy site: Home header, `ShareCard.tsx`, treat box (Rewards), rank/pill labels — kill the hardcoded "her favorite dinner" / "on his tab" strings.

## 2. Install prompt gating
- [x] `InstallPrompt.tsx`: suppress until `onboardedAt` exists AND ≥ 2 distinct days have logged study; keep the weekly re-offer cap afterwards.

## 3. Empty Home
- [x] `DashboardScreen.tsx` first-run state: primary "Log your first session" CTA; rank/shield/rituals sections collapsed or replaced by a one-line explanation until first data exists.

## 4. Verify
- [x] Fresh DB (clear site data): wizard appears; skip through → target 4h, no install sheet within the first minute; log 1 session on each of 2 days → install sheet may appear per weekly rules.
- [x] Names entered → Home, share card, treat box all use them.
- [x] Second load: wizard does not reappear; Settings offers "Run setup again".
- [x] `npm run typecheck` passes.

## 1. Scoring
- [x] `src/utils/scores.ts`: CSAT profile — 2.5/correct, −2.5/3 per wrong (exact thirds), total 200, qualifying 66.67; reuse the fractional arithmetic from the prelims fix.
- [x] Unit tests in `src/utils/scores.test.ts`: e.g. 55 correct / 70 attempted → 137.5 − 15×2.5/3 = 125.00; boundary at 66.67 qualified/not.

## 2. UI
- [x] `TestsScreen.tsx`: exam-type picker gains "CSAT (Paper II)"; result card shows net + Qualified/Not qualified badge vs 66.67.
- [x] Validation identical to prelims form (correct ≤ attempted ≤ total, wrong derived).
- [x] Trend section: separate CSAT series from GS series.

## 3. Home link
- [x] CSAT ritual chip on Home offers "log practice set" quick action (opens the Tests form pre-set to CSAT).

## 4. Verify
- [x] Save a CSAT set 55/70/80 → 125.00, Qualified.
- [x] Save 26/40/80 → 65 − 14×2.5/3 = 53.33, Not qualified.
- [x] GS FLT trend unaffected; CSAT trend separate.
- [x] `npm test` and `npm run typecheck` pass.

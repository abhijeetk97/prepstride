## 1. Scoring arithmetic
- [x] `src/utils/scores.ts`: net = `correct*2 − (attempted−correct)*(2/3)` in exact arithmetic (e.g. work in integer thirds: `(correct*6 − (attempted−correct)*4) / 3`); display rounds to 2dp only.
- [x] Derive `incorrect = attempted − correct` everywhere; remove any separately-entered wrong count (or make it read-only derived).
- [x] Update empty-state and helper copy: "−⅔ per incorrect (exact 1/3 of 2)".

## 2. Validation
- [x] `TestsScreen.tsx` prelims form: enforce `0 ≤ correct ≤ attempted ≤ total`; disable Save with an inline message while invalid.
- [x] Accuracy = correct/attempted; add attempt rate = attempted/total next to it in the summary.

## 3. Tests (first runner in repo)
- [x] `npm i -D vitest` + `test` script; `src/utils/scores.test.ts`: 58/82 → 100.00; 0/0 → 0; all-correct; attempted = 0 accuracy handling; boundary invalid inputs rejected by the validator.

## 4. Verify
- [x] 100 Q, 82 attempted, 58 correct → preview and saved score read **100.00**, accuracy 70.7%, attempt rate 82%.
- [x] correct 90 / attempted 82 → Save disabled with message.
- [x] Single test saved → summary shows attempt rate; trend line copy unchanged.
- [x] `npm test` and `npm run typecheck` pass.

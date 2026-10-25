## Why
Two scoring bugs from the review, both in `src/utils/scores.ts`:

1. **Imprecise negative marking.** Line 5 computes `correct*2 − incorrect*0.666`. A 100-question paper with 82 attempted / 58 correct scored **100.02**; the exact value (58×2 − 24×⅔) is **100.00**. The empty state advertises the "−0.666" figure.
2. **No input validation.** Setting 90 correct against 82 attempted produced **180.00** and accuracy **109.8%** with Save still enabled. There is no check that correct ≤ attempted ≤ total.

## What Changes
- Net score = `correct × 2 − (attempted − correct) × (2/3)`, computed in exact arithmetic (e.g. integer thirds), displayed to 2 decimal places. `incorrect` is derived (`attempted − correct`) — no separately editable wrong-count that can drift.
- Validation on the form: `0 ≤ correct ≤ attempted ≤ totalQuestions`; Save is disabled with an inline message until valid.
- Accuracy (`correct/attempted`) is shown beside **attempt rate** (`attempted/total`).
- All copy (empty state, helper text) updated to exact marking: "−⅔ per wrong (1/3 of 2)".
- Adds **vitest** (first test runner in the repo) with unit tests for the score function — this is the arithmetic users will trust blindly.

## Capability Impact
- `tests`: ADDS requirements (exact scoring arithmetic, validation). Shares the `tests` capability with `p1-add-csat-tests`; implement this change first — CSAT scoring follows the same validation rules.

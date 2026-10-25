## Why
From the review: Tests has no CSAT paper type. CSAT (Prelims Paper II) is qualifying — 80 questions, +2.5 per correct, −2.5/3 per wrong (exact 1/3 of 2.5), 66.67 to qualify — none of which can be recorded today. On Home, CSAT practice is a checkbox.

## What Changes
- New exam type **CSAT (Paper II)** in Tests: per-question value 2.5, negative marking exactly 2.5/3 (computed fractionally like the prelims fix), total 200, qualifying line 66.67.
- Result shows net score + **"Qualified / Not qualified"** against 66.67.
- Same validation as `p0-fix-prelims-scoring` (0 ≤ correct ≤ attempted ≤ total, wrong derived).
- CSAT trend charted separately from GS FLT trend.
- The Home CSAT ritual links to a "log practice set" quick action instead of being only a checkbox.

## Capability Impact
- `tests`: ADDS requirement (CSAT paper type + qualifying line). Implement after `p0-fix-prelims-scoring` — reuses its exact-arithmetic and validation helpers. Analytics slot for CSAT status comes from `p1-fix-analytics`.

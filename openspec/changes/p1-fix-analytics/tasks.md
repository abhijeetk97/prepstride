## 1. Heatmap
- [x] `AnalyticsScreen.tsx:83`: label the actual window — compute first date of the range and render "Last 365 days · {start} → {today}".
- [x] Replace `title=` tooltips with tap interaction: tap a cell → inline detail line (or small popover) with date, minutes, session count. No hover-only info on any element.

## 2. Averages
- [x] Show both metrics, labelled: "7/30-day per calendar day" AND "per study day" (mean over days with > 0 minutes). Keep all-time as total + study-day average.

## 3. Scores section
- [x] New section: last prelims net score + accuracy, accuracy/net trend sparkline across saved mocks, mains average. Place above or beside subject split.
- [x] Leave a slot for CSAT qualifying status (fills in when `p1-add-csat-tests` lands).

## 4. Verify
- [x] On 25 Oct 2026 the heatmap label shows Oct 2025 → today (not "Apr").
- [x] Phone: tap a heatmap cell → detail appears without hover.
- [x] One 2h day in a 30-day window → "4m/day" AND "2h per study day", both labelled.
- [x] Saved prelims + mains mocks appear in the scores section.
- [x] `npm run typecheck` passes.

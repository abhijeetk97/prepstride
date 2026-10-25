## Why
From the review, Analytics mislabels, misleads, and omits the thing that matters most:

- The heatmap is labelled **"Apr → today"** (`src/screens/AnalyticsScreen.tsx:83`) though the window is the trailing ~365 days (late Oct 2025 → today on 25 Oct 2026).
- Cells are 11×11 with **hover-only tooltips** (`title=`) — unusable on a phone.
- Averages fold empty days in as zeros: after one real 2h morning, the 30-day average reads **4m/day**. A solid day reads as noise.
- Mock scores do not appear on this screen at all — the prelims 100.00 and mains 118/250 are invisible here.

## What Changes
- Heatmap label states the true window ("Last 365 days · 25 Oct 2025 → today").
- Cells: tap (or tap-and-hold) opens a small day detail (date, minutes, session count) — no hover-only information anywhere.
- Averages are shown **both ways, labelled**: "per calendar day" and **"per study day"** (non-zero days).
- A **Tests section** on Analytics: last prelims net score + accuracy trend (sparkline), mains average, and CSAT qualifying status once `p1-add-csat-tests` lands.

## Capability Impact
- `analytics`: ADDS requirements (honest heatmap window, tappable day detail, dual averages, scores section). Phantom-session cleanup comes free via `p0-fix-session-and-timer-integrity`.

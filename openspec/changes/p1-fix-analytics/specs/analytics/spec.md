## ADDED Requirements

### Requirement: The heatmap SHALL state its true window
The heatmap label SHALL name the actual date range it renders (e.g. "Last 365 days · 25 Oct 2025 → today"), never a fixed month.

#### Scenario: Trailing year on 25 Oct 2026
- **WHEN** the heatmap renders with a trailing-365-day window
- **THEN** the caption names the true start date (Oct 2025), not "Apr"

### Requirement: Day details SHALL be tap-accessible
Heatmap cells SHALL reveal their day's data (date, minutes, session count) on tap. No analytic information may be hover-only.

#### Scenario: Phone tap
- **WHEN** the user taps a heatmap cell on a touch device
- **THEN** the day's minutes and session count are shown

### Requirement: Averages SHALL be labelled per calendar day and per study day
Averages SHALL display two labelled figures: mean over all calendar days in the window, and mean over study days (days with > 0 minutes).

#### Scenario: One study day in 30
- **WHEN** the last 30 days contain a single 2-hour day
- **THEN** the 30-day averages show both "4m/day (calendar)" and "2h per study day"

### Requirement: Analytics SHALL include test performance
The screen SHALL show the most recent prelims net score with accuracy, a trend across saved mocks, and the mains average.

#### Scenario: After two mocks
- **WHEN** a prelims FLT (100.00) and a mains sectional (118/250) are saved
- **THEN** both appear in the Analytics scores section

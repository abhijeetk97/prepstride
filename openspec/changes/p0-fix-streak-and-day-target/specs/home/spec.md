## ADDED Requirements

### Requirement: Streak SHALL count any studied day
The streak SHALL count consecutive calendar days in which total logged study time is at least 30 minutes. The daily target and any 4-hour cap MUST NOT affect the streak.

#### Scenario: 2-hour day with 8-hour target
- **WHEN** the user logs a 120-minute session on a day whose daily target is 8h
- **THEN** the streak extends by 1 that day
- **AND** Home shows progress toward the target without failure framing

#### Scenario: Day below the study floor
- **WHEN** a day has only 25 minutes of logged study
- **THEN** the streak is neither extended nor broken

#### Scenario: First session of the day
- **WHEN** the day already has ≥ 30 minutes logged
- **THEN** the streak chip shows at least "1 day", never "0 · start today"

### Requirement: Daily target SHALL have one source of truth
The daily target SHALL come from Settings, apply immediately — including to the current day — and never be capped. Shields may require target-met days, labelled as such.

#### Scenario: Target changed mid-day
- **WHEN** the user changes the daily target from 8h to 3h during the day
- **THEN** the ring, day summary, and target-met (shield) logic all use 3h for that same day

#### Scenario: Humane chip range
- **WHEN** the user opens the target quick-chips on Home
- **THEN** the offered range matches Settings (2h–10h), with 4h as the default

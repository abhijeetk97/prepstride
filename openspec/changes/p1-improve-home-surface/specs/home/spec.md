## ADDED Requirements

### Requirement: Timesheet rows SHALL show the topic
Every session row on Home (and the Study screen) SHALL show the user-entered topic in full (up to 2 lines), never reduced to the subject alone and never truncated mid-word on one line.

#### Scenario: Session with topic
- **WHEN** a session "GS2 · Polity & Governance" was logged with topic "Laxmikanth — Fundamental Rights, DPSP, Parliament"
- **THEN** the Home row and Study row both display that full topic text

### Requirement: The rank pill SHALL never clip
Rank labels SHALL wrap or shrink to fit; no rank name is ever visually cut off.

#### Scenario: Longest rank label
- **WHEN** the rank pill renders the longest rank name at 390px width
- **THEN** the full label is readable

## ADDED Requirements

### Requirement: Sessions SHALL never invent times
A manually logged session SHALL store only what the user entered: date, duration, and — solely if the user filled the optional start-time field — that start time. The system MUST NOT derive a start or end time from `now − duration`.

#### Scenario: Quick log without a start time
- **WHEN** the user saves a 120-minute session at 8:34 AM and leaves the start-time field blank
- **THEN** the record stores date + duration only, and every list view shows "2h" without any clock range

#### Scenario: Explicit start time
- **WHEN** the user enters 6:30 AM as the start time
- **THEN** the record stores 6:30 AM verbatim and views may show the 6:30–8:30 range

### Requirement: Sessions shorter than one real minute SHALL be discarded
Timer stops SHALL compute elapsed time from accumulated running time only (pauses excluded), truncate to whole minutes (never round up), and discard any session under 60 seconds of real elapsed time.

#### Scenario: 37-second stopwatch stop
- **WHEN** the user stops the timer after ~37 seconds of running
- **THEN** no session record is created, a toast explains why, and the day total is unchanged

### Requirement: Deleting a session SHALL be undoable
Deleting a session SHALL ask for confirmation, then offer a short Undo window that restores the record byte-for-byte.

#### Scenario: Undo a delete
- **WHEN** the user deletes a session and taps Undo within the toast window
- **THEN** the session reappears with identical fields (subject, topic, duration, times)

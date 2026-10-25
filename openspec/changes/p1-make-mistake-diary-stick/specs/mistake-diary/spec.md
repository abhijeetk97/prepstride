## ADDED Requirements

### Requirement: Mistake cards SHALL show the linked mock
When a mistake is linked to a mock test, the card SHALL show a chip with the mock's name and date; tapping it filters the diary to that mock.

#### Scenario: Linked mistake
- **WHEN** a mistake was saved with a link to "Vision IAS FLT 5 (24 Oct)"
- **THEN** the card displays that chip, and tapping it shows only mistakes from that mock

### Requirement: Takeaway SHALL be multiline
The takeaway field SHALL be a textarea supporting multi-line revision notes.

#### Scenario: Three-line takeaway
- **WHEN** a takeaway containing two line breaks is saved
- **THEN** the card renders it with its line breaks preserved

### Requirement: Mistakes SHALL come back for review
Every active mistake SHALL have a rolling reviewDue (creation/last review + 7 days). The Tests screen shows a banner with the count of due mistakes, a list with one-tap "mark reviewed" (reschedules +7d, increments the review count), and mistakes can be retired from the rhythm after ≥ 2 reviews. Starting a new mock entry nudges to read due mistakes first.

#### Scenario: Due for review
- **WHEN** a mistake's reviewDue is today or in the past
- **THEN** the Tests banner counts it and offers "mark reviewed"

#### Scenario: Mock entry nudge
- **WHEN** the user opens the mock-test form while ≥ 1 mistake is due
- **THEN** a nudge offers to show the due mistakes before entry

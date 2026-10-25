## ADDED Requirements

### Requirement: Answer writing SHALL capture the answer, not a count
The answer-writing ritual SHALL open a micro-sheet capturing question/source, minutes, an optional self-rating (0–10), and an optional note. The record is saved to mains practice history (Tests screen) instead of incrementing a bare 1/2/3 counter.

#### Scenario: Logging one answer
- **WHEN** the user taps the answer-writing chip and saves "Q7 — federalism · 8 min · 6/10"
- **THEN** a mains practice record is created and visible in the Tests mains history, and the ritual shows it counted

### Requirement: The newspaper ritual SHALL accept one line
After the newspaper ritual is checked, an optional one-line note (e.g. "Editorial: …") SHALL be stored with the day and displayed beside the struck-through ritual row.

#### Scenario: Editorial note
- **WHEN** the user checks the newspaper ritual and enters "Editorial: sedition debate"
- **THEN** the note persists for that day and renders with the completed ritual, including after reload

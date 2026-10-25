## ADDED Requirements

### Requirement: Chapter progress SHALL be settable directly
Tapping a book's chapter counter SHALL open an inline input/stepper accepting any chapter 0–totalChapters in one interaction, with % done displayed. The + control remains for single-chapter advances.

#### Scenario: Jumping ahead
- **WHEN** the user taps "1/75" on Laxmikanth and enters 12
- **THEN** the row immediately reads "ch 12 / 75 · 16%"

### Requirement: A row SHALL be one book
Each booklist row SHALL represent exactly one book/source with its own chapter count. Multi-source rows are split in the seed and by migration for existing databases.

#### Scenario: Economy shelf
- **WHEN** the booklist renders the economy sources
- **THEN** Nitin Singhania, Ramesh Singh, and Mrunal appear as separate rows with separate progress

### Requirement: Books SHALL track revision passes
Each row SHALL carry a revision counter (0–3+) adjustable by a stepper, rendered as "Rev ×N".

#### Scenario: Second pass
- **WHEN** the user bumps a completed book's revision counter to 2
- **THEN** the row reads "Rev ×2" without touching chapter progress

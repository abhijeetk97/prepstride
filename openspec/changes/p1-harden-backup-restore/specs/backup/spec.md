## ADDED Requirements

### Requirement: Export SHALL confirm success
A completed export SHALL show a toast naming the written file and its timestamp.

#### Scenario: Export on phone
- **WHEN** the user taps Export and the file is written
- **THEN** a toast confirms the backup file by name

### Requirement: Restore SHALL parse, summarize, and confirm before any write
Restore SHALL parse the chosen file and show a confirmation modal with its contents (sessions, tests, mistakes, syllabus items, date range) and an explicit "Replace all data" action. Cancelling — or an unparseable file — writes nothing.

#### Scenario: Valid backup, then cancel
- **WHEN** the user picks a valid backup file and taps Cancel in the modal
- **THEN** the database is unchanged

#### Scenario: Valid backup, confirmed
- **WHEN** the user confirms "Replace all data"
- **THEN** all tables are replaced, a success toast shows, and live screens update without a manual reload

#### Scenario: Invalid file
- **WHEN** the picked file fails parsing
- **THEN** an error toast names the problem and no data is touched

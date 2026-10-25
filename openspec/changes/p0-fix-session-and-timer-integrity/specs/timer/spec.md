## ADDED Requirements

### Requirement: Only one live session SHALL exist
While a timer session is live, the system SHALL block starting another session. Any "start"-labelled control becomes "Back to session" and reopens the running timer.

#### Scenario: Second start attempt
- **WHEN** a session is running and the user taps the Home primary button
- **THEN** the running timer opens; no new start sheet appears and the live session is unchanged

### Requirement: The live-session bar SHALL NOT cover content
The running-session indicator SHALL reserve its own layout space; no screen content (including Home's rituals) may be overlapped or pushed under the tab bar by it.

#### Scenario: Timer running on Home
- **WHEN** a session is running and the user views Home
- **THEN** "Today's rituals" remains fully visible and tappable

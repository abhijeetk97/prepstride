## ADDED Requirements

### Requirement: First run SHALL collect identity, optional, and a humane target
Before the main app is usable, a skippable wizard (≤ 3 steps) SHALL collect: her name and partner name (used in all copy), the optional subject (or "Decide later"), and a daily target from presets 2/3/4/6h with a 4h default. It never re-shows on its own and is re-runnable from Settings.

#### Scenario: Fresh install
- **WHEN** the app first opens on an empty database
- **THEN** the wizard appears before the Home scoreboard, and no install prompt covers it

#### Scenario: Skipped
- **WHEN** the user skips the wizard
- **THEN** defaults apply (current labels, no optional loaded, 4h target) and the wizard never reappears unprompted

### Requirement: The install prompt SHALL wait for real usage
The add-to-home-screen prompt SHALL be suppressed until onboarding is complete and at least 2 distinct days have logged study; the weekly re-offer cadence starts only after that.

#### Scenario: Six seconds in
- **WHEN** a brand-new user has the app open with no study logged
- **THEN** no install prompt appears

### Requirement: Empty Home SHALL point to one action
Until any study data exists, Home SHALL show a single primary action ("Log your first session") and explain rituals in one line; rank, shields, and streak walls appear only after first data.

#### Scenario: Day-zero Home
- **WHEN** no sessions exist
- **THEN** Home's focal element is the log CTA, not the rank/shield scoreboard

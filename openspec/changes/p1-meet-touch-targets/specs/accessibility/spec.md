## ADDED Requirements

### Requirement: Interactive controls SHALL meet a 44px hit-area floor
Every tappable control SHALL provide a hit area of at least 44×44px, achieved via padding or an expanded pseudo-element when the visual glyph is smaller. No primary or destructive control renders within the bottom tab-bar safe area.

#### Scenario: Measured on device
- **WHEN** each audited control (energy/focus stars, ritual chips and rows, syllabus status pill, session delete, book stepper, icon-only buttons) is measured at 390px
- **THEN** its hit area is at least 44×44px

#### Scenario: Export under the tab bar
- **WHEN** Settings renders with the tab bar visible
- **THEN** Export and Restore are fully tappable and clear of the safe area

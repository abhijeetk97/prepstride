## ADDED Requirements

### Requirement: Badges SHALL evaluate only on real recorded data
Achievements that depend on time of day (e.g. Dawn Warrior, "2-hour session before 8:00 AM") SHALL evaluate only against start times the user explicitly entered or that the timer captured. Inferred or absent start times MUST NOT satisfy any badge condition.

#### Scenario: Quick log without start time
- **WHEN** a 120-minute session is saved at 8:34 AM with no start time entered
- **THEN** Dawn Warrior remains locked

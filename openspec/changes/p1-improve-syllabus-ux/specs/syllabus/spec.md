## ADDED Requirements

### Requirement: The syllabus SHALL open on Prelims in exam order
The screen SHALL default to the Prelims paper (the nearest exam). Papers SHALL render in exam order — Prelims, Mains GS1–GS4, Essay, CSAT, Optional — and categories within a paper render in syllabus-document order, never alphabetically.

#### Scenario: Fresh open
- **WHEN** the user opens the Syllabus tab
- **THEN** Prelims is the active paper and its categories appear in document order

### Requirement: Essay SHALL be a first-class paper
The syllabus SHALL include an Essay section with practice items (structure, past topics, timed writes), selectable from the paper tabs and counted in progress.

#### Scenario: Essay tab
- **WHEN** the user switches to the Essay paper
- **THEN** it lists seeded essay-practice topics that behave like any other syllabus item (statuses, revision, progress)

### Requirement: The status control SHALL be readable and predictable
The status control SHALL be at least 36px tall with a 44px hit area, text ≥ 12px at ≥ 4.5:1 contrast in every theme, and show what the next tap will do ("Next: Notes prepared"). Direct status selection is available (long-press or menu).

#### Scenario: Predictable cycling
- **WHEN** the user looks at a topic at "First reading"
- **THEN** the control shows the current status and that the next tap sets "Notes prepared"

### Requirement: Paper chips SHALL never clip labels
The paper chip row SHALL scroll horizontally with a visible affordance (snap + edge fades); no chip label is cut mid-word at 390px or in the 512px desktop column.

#### Scenario: Narrow viewport
- **WHEN** the Syllabus screen renders at 390px width with all papers present
- **THEN** every visible chip's label is fully readable and the row visibly scrolls

### Requirement: The Prelims date SHALL be labelled as expected until official
The countdown SHALL label the Prelims date "expected" until an official notification date is entered in Settings.

#### Scenario: Default state
- **WHEN** no official date has been entered
- **THEN** the countdown reads as an estimate (e.g. "Prelims: expected 23 May 2027 · ~210 days")

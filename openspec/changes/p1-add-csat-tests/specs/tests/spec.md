## ADDED Requirements

### Requirement: Tests SHALL support the CSAT paper with exact qualifying arithmetic
A CSAT (Paper II) exam type SHALL score +2.5 per correct and −2.5/3 per wrong in exact arithmetic (total 200), show the net score with a Qualified/Not-qualified verdict against the 66.67 line, and enforce the same validation as Prelims (0 ≤ correct ≤ attempted ≤ total; wrong derived as attempted − correct). CSAT results trend separately from GS tests.

#### Scenario: Comfortable qualify
- **WHEN** 55 correct of 70 attempted on the 80-question CSAT is saved
- **THEN** the net score is exactly 125.00 and the verdict is Qualified

#### Scenario: Below the line
- **WHEN** 26 correct of 40 attempted is saved
- **THEN** the net score is exactly 53.33 and the verdict is Not qualified

#### Scenario: Separate trends
- **WHEN** both GS FLTs and CSAT sets exist
- **THEN** the trend view charts them as separate series

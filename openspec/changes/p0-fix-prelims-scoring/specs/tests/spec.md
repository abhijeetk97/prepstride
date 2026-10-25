## ADDED Requirements

### Requirement: Prelims net score SHALL use exact negative marking
The net score SHALL equal correct × 2 − (attempted − correct) × 2/3, computed in exact arithmetic and displayed to two decimals. The wrong count is always derived as attempted − correct.

#### Scenario: 58 correct of 82 attempted
- **WHEN** a 100-question paper is entered with 82 attempted and 58 correct
- **THEN** the net score is exactly 100.00 (not 100.02), with 24 wrong and 70.7% accuracy

### Requirement: Test forms SHALL reject impossible papers
Save SHALL stay disabled unless 0 ≤ correct ≤ attempted ≤ totalQuestions for the paper, with an inline message naming the violated constraint.

#### Scenario: Correct exceeds attempted
- **WHEN** correct is 90 while attempted is 82
- **THEN** Save is disabled and the form explains that correct cannot exceed attempted

#### Scenario: Attempted exceeds total
- **WHEN** attempted is 110 on a 100-question paper
- **THEN** Save is disabled and the form explains that attempted cannot exceed total questions

### Requirement: Summary SHALL show attempt rate
The prelims summary SHALL show accuracy (correct/attempted) alongside attempt rate (attempted/total).

#### Scenario: Summary after save
- **WHEN** the 82/58/24 paper above is saved
- **THEN** the summary shows accuracy 70.7% and attempt rate 82%

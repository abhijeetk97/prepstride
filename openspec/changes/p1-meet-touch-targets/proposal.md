## Why
Measured controls from the review, all far below any usable phone minimum: energy/focus stars **24×24**, ritual rows/chips **~32–34px**, syllabus status pill **23px tall**, session delete **27×27**, book next-chapter **20×20**. The Export button also sat close enough to the tab bar to be occluded.

## What Changes
- A global floor: every interactive control has a **≥ 44×44px hit area**. Visual glyphs may stay smaller; padding or an expanded pseudo-element provides the area.
- Audited components (from the review's measurements): energy/focus stars, ritual chips and rows, syllabus status pill (final size co-owned with `p1-improve-syllabus-ux`), session delete/edit, book stepper and next-chapter, all icon-only buttons.
- Bottom-bar adjacency audit: no primary or destructive control renders within the tab-bar safe area (Export/Restore in Settings move up).

## Capability Impact
- `accessibility`: ADDS requirement (44px floor + audited list + safe-area rule). Cross-cutting; touches many components but each change is mechanical.

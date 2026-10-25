## ADDED Requirements

### Requirement: Every read topic SHALL carry a next-revision due date
A syllabus item past `not_started` SHALL always carry a computed `nextRevisionDue`: first revision due 3 days after the last touch; after revision n, the next due date is 7 / 21 / 60 / 60… days after the last touch for n = 1 / 2 / 3 / 4+. Mastered items are the only exception (permanently out of the queue).

#### Scenario: Topic marked read today
- **WHEN** a topic completes its first reading on 25 Oct
- **THEN** its `nextRevisionDue` is 28 Oct and it appears in the queue's Next-7-days section

#### Scenario: Full ladder
- **WHEN** revisions 1, 2, 3 and 4 are completed on consecutive due dates
- **THEN** the following due dates are scheduled at +7d, +21d, +60d and +60d respectively — none of the four steps is skipped

#### Scenario: Mastered
- **WHEN** the user explicitly marks a topic Mastered (only available after ≥ 1 revision)
- **THEN** it never reappears in the queue or stale list

### Requirement: The revision queue SHALL show what is due and what is coming
The queue SHALL list Overdue, Due today, and a Next-7-days preview. An empty "due now" state names the next upcoming item and its date.

#### Scenario: Nothing due today
- **WHEN** no item is due today or overdue
- **THEN** the queue says so and names the next item and its due date

### Requirement: Stale SHALL flag neglected topics
Stale SHALL mean: due date in the past, OR read more than 14 days ago with zero revisions completed.

#### Scenario: Read but never revised
- **WHEN** a topic was first read 15 days ago and has revisionCount 0
- **THEN** it appears in the stale list even though it never had a due date before this change

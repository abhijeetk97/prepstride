# Planner behavior

- A week is the local Monday through Sunday, including both dates. Navigation crosses months and years without UTC conversion.
- A weekly hours goal is explicit, independently saved per week; targetMinutes = round(hours × 60). Range: 1–168 hours. The initial suggestion is six times the daily target.
- Targets contain a title, paper/subject, optional syllabus reference, activity, optional outcome, optional in-week date, estimated minutes (integer 15–1440), completion state and creation time.
- Planned minutes = sum of all selected-week target estimates, including completed targets. Logged minutes = sum of saved sessions whose local dates fall within the week. Targets done = completed target count / total count. The progress bar represents this count, not logged hours.
- Selecting multiple topics applies activity, outcome, day and per-target estimate to each; the form shows the aggregate estimate before saving.
- Completing or reopening a target changes only that target. Timer handoff prefills topic and subject; an active timer is reopened instead of replaced.
- Day filters show scheduled or flexible targets. Editing permits rescheduling within the selected week. Removal offers Undo.
- Carry-forward offers only unfinished targets from the immediately preceding week. It copies selected targets with fresh IDs, no assigned day and carriedFrom references, retaining the source history. An existing source reference or identical title/paper/activity in the destination suppresses a duplicate.
- Export includes weeklyPlans and weeklyTargets. Restore replaces both; a legacy backup without planner tables restores them as empty.

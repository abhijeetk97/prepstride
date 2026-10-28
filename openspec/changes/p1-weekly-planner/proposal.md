# Weekly planner

Requested 28 October 2026: add weekly target setting with topic selection, review the design from UX and UPSC preparation perspectives, implement directly on main, and deploy to GitHub Pages.

The planner turns syllabus topics into manageable weekly outcomes. It reuses the existing paper taxonomy, syllabus and timer, and supports custom practice/current affairs targets. A saved weekly hours goal helps expose overcommitment. Completion tracks outcomes; actual study time remains derived only from time logs.

## UX and preparation review

- **Findability:** a prominent Home card and a More entry open the same planner; no extra crowded bottom-navigation tab.
- **Planning friction:** two short steps separate choosing topics from planning the work. Search and paper filters reuse existing syllabus data; multi-selection works across papers.
- **Reviewability:** selected topics can be reviewed before adding. The form states that duration is per topic and shows the multiplied total. Each saved target can be edited separately.
- **Realistic workload:** the suggested hours goal uses six days of the daily goal, is explicitly editable and never silently saved. Over-allocation and remaining capacity are visible. Flexible days and catch-up time are supported.
- **UPSC relevance:** reading, spaced revision, MCQs/PYQs, answer writing and mock analysis have distinct activity labels and outcome prompts. Due-by-Sunday filtering supports the existing revision schedule. Current affairs and optional subjects can use custom targets.
- **Trust:** target completion does not add logged minutes or advance syllabus status. Both are explained in the UI. Historical plans remain available; carry-forward is deliberate, retains history and avoids duplicate copies.
- **After populated-screen review:** compacted the overview and placed Add targets alongside the heading so the first day’s target is visible above the phone navigation.
- **Mobile/accessibility:** reviewed at 390px and a narrow phone width; labelled fields, 44px action controls, ink/paper contrast across themes, dialog focus containment, Escape dismissal and focus restoration. Sticky composer actions stay reachable.
- **Data integrity:** Dexie v3 adds two tables; backup export/restore includes them. Existing v2 data and legacy backups remain supported.

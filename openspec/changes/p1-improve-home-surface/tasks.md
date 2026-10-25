## 1. Topic visibility
- [x] `DashboardScreen.tsx` timesheet rows: render `topic` as a second line (max 2 lines + wrap, no ellipsis-before-line-2).
- [x] `TimesheetScreen.tsx`: full topic, no mid-word truncation.

## 2. Share card naming
- [x] `src/components/partner/ShareCard.tsx` + `src/utils/share.ts`: subject label as "Polity & Governance (GS2)" style; include topic line; use her/partner names from settings (fall back gracefully if onboarding not run).

## 3. Rank pill
- [x] Find rank pill in `DashboardScreen.tsx` / `RewardsScreen.tsx`: wrap or shrink-to-fit so "The Novice Aspirant" never clips.

## 4. Ritual depth
- [x] Answer-writing chip (`DashboardScreen.tsx` rituals): tap opens micro-sheet — question/source (text), minutes (number), self-rating 0–10 (optional), note (optional). Save → new record type or `mockTests` mains-practice entry surfaced in `TestsScreen.tsx` mains history.
- [x] Newspaper chip: after checking, inline optional one-line note field persisted per-day (extend the rituals/day store); note renders beside the struck-through row.

## 5. Verify
- [x] Log session with topic → Home row and Study row show full topic; share card shows "Polity & Governance (GS2)" + topic.
- [x] Answer-writing sheet: save "Q7 — federalism, 8 min, 6/10" → appears in Tests mains history.
- [x] Newspaper note: type "Editorial: sedition debate" → visible after reload.
- [x] `npm run typecheck` passes.

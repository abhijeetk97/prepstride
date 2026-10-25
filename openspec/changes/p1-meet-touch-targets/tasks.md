## 1. Audit
- [x] Sweep `src/screens/` + `src/components/` for icon buttons/chips; list every control currently under 44×44 hit area (the review's measurements are the seed list: stars, rituals, status pill, session delete, book stepper, Export/Restore).

## 2. Fix
- [x] Apply the floor via a shared utility class or wrapper (e.g. `min-h-[44px] min-w-[44px]` or an expanded `::before`) — glyphs stay visually small where design needs it.
- [x] Settings: move Export/Restore clear of the tab-bar safe area.
- [x] Record the 44px rule in `openspec/project.md` conventions (already noted).

## 3. Verify
- [x] Devtools-measure each audited control ≥ 44×44 at 390px.
- [x] One-handed pass: check/uncheck rituals, rate energy, cycle a syllabus status, delete a session, bump a book — no mis-taps.
- [x] `npm run typecheck` passes.

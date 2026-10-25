## 1. Audit
- [ ] Sweep `src/screens/` + `src/components/` for icon buttons/chips; list every control currently under 44×44 hit area (the review's measurements are the seed list: stars, rituals, status pill, session delete, book stepper, Export/Restore).

## 2. Fix
- [ ] Apply the floor via a shared utility class or wrapper (e.g. `min-h-[44px] min-w-[44px]` or an expanded `::before`) — glyphs stay visually small where design needs it.
- [ ] Settings: move Export/Restore clear of the tab-bar safe area.
- [ ] Record the 44px rule in `openspec/project.md` conventions (already noted).

## 3. Verify
- [ ] Devtools-measure each audited control ≥ 44×44 at 390px.
- [ ] One-handed pass: check/uncheck rituals, rate energy, cycle a syllabus status, delete a session, bump a book — no mis-taps.
- [ ] `npm run typecheck` passes.

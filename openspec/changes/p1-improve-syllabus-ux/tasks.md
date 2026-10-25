## 1. Ordering
- [ ] `SyllabusScreen.tsx`: default selected paper = Prelims; paper tab order hard-coded to Prelims, GS1–GS4, Essay, CSAT, Optional (no alphabetical grouping anywhere).
- [ ] `src/data/syllabus.ts` + `src/db/seed.ts`: add explicit `order` on categories/papers; render in that order.

## 2. Essay paper
- [ ] Add Essay section to the seed (8–12 practice items: structure drill, past-topic brainstorm, timed write, peer review, etc.); appears in paper tabs and progress counts.

## 3. Status pill
- [ ] Redesign the status control: ≥ 36px tall (44px hit area per touch-target change), ≥ 12px text, ≥ 4.5:1 contrast against its background in every theme.
- [ ] Show current status + a "Next: <status>" affordance so the cycling behavior is predictable; keep tap-to-cycle, add long-press (or a small menu) for direct status selection.

## 4. Paper chips
- [ ] Chip row: `overflow-x-auto` + scroll-snap + fade masks at both ends; no label clipped at 390px or in the 512px desktop column.

## 5. Countdown
- [ ] Label the Prelims date "expected" everywhere it appears; add an optional official-date field in Settings that replaces the label when set.

## 6. Verify
- [ ] Open Syllabus fresh → Prelims tab active, categories in syllabus order (Polity first region, Current Events last-ish per document), Essay tab present.
- [ ] Contrast-check the status pill in all 5 themes (axe or manual ≥ 4.5:1).
- [ ] 390px and 512px: chips scroll with visible affordance; nothing reads "Mai…".
- [ ] `npm run typecheck` passes.

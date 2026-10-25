## Why
From the review: Laxmikanth is tracked as 75 chapters advanced by a 20×20 "+" button — 75 taps per pass, another full pass for revisions. And rows like "Indian Economy — Nitin Singhania / Ramesh Singh / Mrunal" pack three sources into one 30-chapter row (same for Shankar/PMF IAS and the ancient-medieval line), so progress is against no book in particular.

## What Changes
- Tapping the chapter counter opens an **inline number input/stepper** to set the current chapter directly ("ch 12 / 75", % done). The + button remains for single-chapter bumps.
- Seed rows are **split one row per book** (Nitin Singhania; Ramesh Singh; Mrunal; Shankar; PMF IAS; separate ancient and medieval lines) with per-book chapter counts.
- Each row gains an optional **revisions-done counter** (0–3+) so a completed book tracks revision passes without 75 more taps.

## Capability Impact
- `booklist`: ADDS requirements (direct chapter entry, one book per row, revision counter). Seed changes in `src/db/seed.ts` / booklist seed data with a migration that splits existing combined rows (preserve progress proportionally or reset with a notice — implementer's call, note it in the PR).

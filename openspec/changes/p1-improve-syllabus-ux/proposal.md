## Why
From the review, the syllabus screen fights both the exam and the phone:

- It **opens on Mains GS1** while the countdown says Prelims is in 210 days; categories sort **alphabetically** (Prelims shows "Current Events" before "Polity"; GS1 shows Geography before Indian Culture).
- The status pill is ~23×80px with 10px white-on-grey type at ~2.1:1 contrast, and tapping cycles statuses without ever saying what the next tap does.
- Paper chips overflow at 390px ("Mai…") and still overflow in the 512px desktop column with no hint the row scrolls.
- **Essay** does not exist as a syllabus paper at all (only as a time-log subject); the countdown shows the hard-coded 23 May 2027 Prelims date as fact.

## What Changes
- Default paper = **Prelims**; paper order fixed to exam order: Prelims → Mains GS1–GS4 → Essay → CSAT → Optional.
- Categories render in **syllabus-document order** (seed data carries an explicit order; the alphabetic sort is dropped).
- Status control redesigned: ≥ 36px tall, ≥ 12px text, ≥ 4.5:1 contrast, and it states the **next action** ("Next: Notes prepared") so a tap is never a surprise.
- **Essay section added** to the syllabus seed (practice items: structure drills, past topics, brainstorming, timed writes).
- Chip row becomes a proper horizontal scroller (scroll-snap, fade edges) that never clips mid-label at 390px.
- The Prelims countdown is labelled **"expected"** until an official date is entered (Settings field).

## Capability Impact
- `syllabus`: ADDS requirements (default paper + order, category order, status control, chips, Essay section, countdown labelling).
- Seed/data changes in `src/data/syllabus.ts` + `src/db/seed.ts`; visual pill sizing co-owned with `p1-meet-touch-targets` (44px floor).

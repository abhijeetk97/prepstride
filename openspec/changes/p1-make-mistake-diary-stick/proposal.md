## Why
From the review: the mistake form is fill-once-and-forget. The mock link is saved but **invisible** on the card ("Polity · 25 Oct" only); the takeaway is a single-line field; nothing ever resurfaces a mistake before the next FLT. "A topper will not maintain a diary that does not come back on its own."

## What Changes
- The card shows the linked mock as a chip (mock name · date); tapping it filters the diary to that mock.
- The takeaway becomes a multiline textarea.
- A **review rhythm**: mistakes default to "review before next mock"; each mistake gets a rolling `reviewDue` (+7 days from creation or last review) and a review counter.
- The Tests screen shows a **"N mistakes due for review"** banner with the due list and a one-tap "mark reviewed" action (which reschedules +7d until dismissed for good).
- Logging a new mock nudges: "3 mistakes are due for review — read them first?" before the form.

## Capability Impact
- `mistake-diary`: ADDS requirements (visible mock link, multiline takeaway, review rhythm, mock-entry nudge). Store change in `src/db/index.ts` (`mistakeLogs`: `reviewDue`, `reviewCount`) with a backfill for existing rows.

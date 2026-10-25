import { describe, expect, it } from 'vitest';
import { splitBookRows } from './books';

describe('booklist split', () => {
  it('keeps economy progress on the first source and resets the others', () => {
    const { rows, split } = splitBookRows([
      {
        title: 'Indian Economy — Nitin Singhania / Ramesh Singh / Mrunal',
        subject: 'Economy',
        totalChapters: 30,
        completedChapters: 10,
        currentRevision: 1
      }
    ]);
    expect(split).toBe(true);
    expect(rows.map((row) => row.title)).toEqual([
      'Indian Economy — Nitin Singhania',
      'Indian Economy — Ramesh Singh',
      'Indian Economy — Mrunal'
    ]);
    expect(rows[0].completedChapters).toBe(10);
    expect(rows[0].revisionsDone).toBe(1);
    expect(rows[1].completedChapters).toBe(0);
    expect(rows[2].completedChapters).toBe(0);
  });

  it('leaves a single-book row alone', () => {
    const { rows, split } = splitBookRows([
      {
        title: 'Indian Polity — M. Laxmikanth',
        subject: 'Polity',
        totalChapters: 75,
        completedChapters: 12,
        currentRevision: 0,
        revisionsDone: 0
      }
    ]);
    expect(split).toBe(false);
    expect(rows[0].completedChapters).toBe(12);
    expect(rows[0].title).toBe('Indian Polity — M. Laxmikanth');
  });
});

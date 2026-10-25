import { describe, expect, it } from 'vitest';
import { accuracyRate, attemptRate, csatQualified, csatScore, prelimsInputError, prelimsScore } from './scores';

describe('prelims score', () => {
  it('58 correct of 82 attempted is exactly 100.00', () => {
    const score = prelimsScore(58, 82 - 58);
    expect(score).toBe(100);
    expect(score.toFixed(2)).toBe('100.00');
    expect(accuracyRate(58, 82)).toBe(70.7);
    expect(attemptRate(82, 100)).toBe(82);
  });

  it('scores an empty paper as 0 and does not divide accuracy by zero', () => {
    expect(prelimsScore(0, 0)).toBe(0);
    expect(accuracyRate(0, 0)).toBe(0);
    expect(attemptRate(0, 100)).toBe(0);
  });

  it('gives full marks when every attempt is correct', () => {
    expect(prelimsScore(100, 0)).toBe(200);
    expect(accuracyRate(100, 100)).toBe(100);
  });

  it('rejects impossible papers', () => {
    expect(prelimsInputError(100, 82, 90)).toBe('Correct cannot exceed attempted.');
    expect(prelimsInputError(100, 110, 50)).toBe('Attempted cannot exceed total questions.');
    expect(prelimsInputError(100, -1, 0)).toBe('Enter whole numbers, zero or more.');
    expect(prelimsInputError(100, 82.5, 50)).toBe('Enter whole numbers, zero or more.');
    expect(prelimsInputError(100, 82, 58)).toBeNull();
  });
});

describe('CSAT score', () => {
  it('scores 55 correct of 70 attempted as 125.00 and qualified', () => {
    const score = csatScore(55, 70 - 55);
    expect(score).toBe(125);
    expect(score.toFixed(2)).toBe('125.00');
    expect(csatQualified(score)).toBe(true);
  });

  it('scores 26 correct of 40 attempted as 53.33 and not qualified', () => {
    const score = csatScore(26, 40 - 26);
    expect(score.toFixed(2)).toBe('53.33');
    expect(csatQualified(score)).toBe(false);
  });

  it('qualifies a paper that lands on 66.67 and not the step below', () => {
    const onLine = csatScore(30, 10);
    expect(onLine.toFixed(2)).toBe('66.67');
    expect(csatQualified(onLine)).toBe(true);
    expect(csatQualified(csatScore(29, 11))).toBe(false);
  });
});

import {resolveConflict} from '../conflict';

describe('resolveConflict', () => {
  it('prefers the newer local edit', () => {
    expect(
      resolveConflict(
        {updatedAt: '2026-08-18T10:00:00.000Z'},
        {updatedAt: '2026-08-18T09:00:00.000Z'},
      ),
    ).toBe('local');
  });

  it('prefers the newer remote edit', () => {
    expect(
      resolveConflict(
        {updatedAt: '2026-08-18T09:00:00.000Z'},
        {updatedAt: '2026-08-18T10:00:00.000Z'},
      ),
    ).toBe('remote');
  });

  it('breaks exact ties toward remote so the outcome is deterministic', () => {
    const t = '2026-08-18T10:00:00.000Z';
    expect(resolveConflict({updatedAt: t}, {updatedAt: t})).toBe('remote');
  });
});

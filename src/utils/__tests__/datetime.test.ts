import {isAfter, nowIso} from '../datetime';

describe('datetime', () => {
  it('produces a parseable ISO string', () => {
    expect(Number.isNaN(Date.parse(nowIso()))).toBe(false);
  });

  it('reports a later timestamp as after an earlier one', () => {
    expect(
      isAfter('2026-08-18T10:00:00.000Z', '2026-08-18T09:00:00.000Z'),
    ).toBe(true);
  });

  it('reports an earlier timestamp as not after', () => {
    expect(
      isAfter('2026-08-18T09:00:00.000Z', '2026-08-18T10:00:00.000Z'),
    ).toBe(false);
  });

  it('treats equal timestamps as not after', () => {
    const t = '2026-08-18T10:00:00.000Z';
    expect(isAfter(t, t)).toBe(false);
  });
});

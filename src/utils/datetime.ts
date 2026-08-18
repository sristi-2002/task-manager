export const nowIso = (): string => new Date().toISOString();

/** Strictly after. Equal timestamps return false — callers rely on this for tie-breaking. */
export const isAfter = (a: string, b: string): boolean =>
  Date.parse(a) > Date.parse(b);

export const EPOCH = '1970-01-01T00:00:00.000Z';

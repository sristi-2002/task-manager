/**
 * RFC4122-shaped v4 identifier. Math.random is sufficient here: ids are
 * namespaced per user in Firestore and never used as a security token.
 */
export const generateId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

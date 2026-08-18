import {validateEnv} from '../env';

describe('validateEnv', () => {
  const valid = {
    APP_ENV: 'development',
    APP_NAME: 'TaskManager Dev',
    ENABLE_LOGGING: 'true',
    SYNC_DEBOUNCE_MS: '2000',
  };

  it('parses a complete config into typed values', () => {
    expect(validateEnv(valid)).toEqual({
      APP_ENV: 'development',
      APP_NAME: 'TaskManager Dev',
      ENABLE_LOGGING: true,
      SYNC_DEBOUNCE_MS: 2000,
    });
  });

  it('throws naming the missing key', () => {
    const {APP_NAME, ...missing} = valid;
    expect(() => validateEnv(missing)).toThrow(/APP_NAME/);
  });

  it('rejects an unknown APP_ENV', () => {
    expect(() => validateEnv({...valid, APP_ENV: 'qa'})).toThrow(/APP_ENV/);
  });

  it('treats any value other than "true" as false', () => {
    expect(validateEnv({...valid, ENABLE_LOGGING: 'false'}).ENABLE_LOGGING).toBe(
      false,
    );
  });

  it('throws when a numeric key is not a number', () => {
    expect(() => validateEnv({...valid, SYNC_DEBOUNCE_MS: 'soon'})).toThrow(
      /SYNC_DEBOUNCE_MS/,
    );
  });
});

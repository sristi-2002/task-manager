import Config from 'react-native-config';

export type AppEnvName = 'development' | 'staging' | 'production';

export type AppEnv = {
  APP_ENV: AppEnvName;
  APP_NAME: string;
  ENABLE_LOGGING: boolean;
  SYNC_DEBOUNCE_MS: number;
};

const ENV_NAMES: AppEnvName[] = ['development', 'staging', 'production'];

const required = (
  raw: Record<string, string | undefined>,
  key: string,
): string => {
  const value = raw[key];
  if (value === undefined || value === '') {
    throw new Error(
      `[env] Missing required key "${key}". Check the .env file bound to this build flavor.`,
    );
  }
  return value;
};

export const validateEnv = (
  raw: Record<string, string | undefined>,
): AppEnv => {
  const appEnv = required(raw, 'APP_ENV');
  if (!ENV_NAMES.includes(appEnv as AppEnvName)) {
    throw new Error(
      `[env] APP_ENV must be one of ${ENV_NAMES.join(
        ', ',
      )}, received "${appEnv}".`,
    );
  }

  const debounceRaw = required(raw, 'SYNC_DEBOUNCE_MS');
  const debounce = Number(debounceRaw);
  if (!Number.isFinite(debounce)) {
    throw new Error(
      `[env] SYNC_DEBOUNCE_MS must be a number, received "${debounceRaw}".`,
    );
  }

  return {
    APP_ENV: appEnv as AppEnvName,
    APP_NAME: required(raw, 'APP_NAME'),
    ENABLE_LOGGING: required(raw, 'ENABLE_LOGGING') === 'true',
    SYNC_DEBOUNCE_MS: debounce,
  };
};

export const env: AppEnv = validateEnv(
  Config as unknown as Record<string, string | undefined>,
);

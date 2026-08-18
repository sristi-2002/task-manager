import {env} from '../config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';

const write = (level: Level, message: string, ...args: unknown[]): void => {
  // Errors always surface; everything else is environment-gated.
  if (!env.ENABLE_LOGGING && level !== 'error') {
    return;
  }

  const line = `[${level.toUpperCase()}] ${message}`;

  if (level === 'error') {
    console.error(line, ...args);
  } else if (level === 'warn') {
    console.warn(line, ...args);
  } else {
    console.log(line, ...args);
  }
};

export const logger = {
  debug: (message: string, ...args: unknown[]) =>
    write('debug', message, ...args),
  info: (message: string, ...args: unknown[]) => write('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => write('warn', message, ...args),
  error: (message: string, ...args: unknown[]) =>
    write('error', message, ...args),
};

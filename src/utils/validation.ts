const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Email is required.';
  }
  return EMAIL_PATTERN.test(trimmed) ? null : 'Enter a valid email address.';
};

export const validatePassword = (value: string): string | null => {
  if (!value) {
    return 'Password is required.';
  }
  return value.length >= 6 ? null : 'Password must be at least 6 characters.';
};

export const validateTitle = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Title is required.';
  }
  return trimmed.length <= 120
    ? null
    : 'Title must be 120 characters or fewer.';
};

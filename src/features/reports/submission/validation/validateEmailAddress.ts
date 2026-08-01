const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailAddress(value: string) {
  return EMAIL_PATTERN.test(String(value).trim());
}

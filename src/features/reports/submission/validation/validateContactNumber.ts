const PHONE_PATTERN = /^[\d+\-()\s]{7,25}$/;

export function validateContactNumber(value: string) {
  return PHONE_PATTERN.test(String(value).trim());
}

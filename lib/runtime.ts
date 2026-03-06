const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function isMockMode(): boolean {
  const value = process.env.MOCK_MODE;
  if (!value) return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

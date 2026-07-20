
export const blankToNull = (value: string): string | null =>
  value === '' ? null : value;

export const blankToNumber = (value: string): number | null =>
  value === '' ? null : Number(value);

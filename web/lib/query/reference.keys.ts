export const referenceKeys = {
  all: ['reference'] as const,
  groups: () => [...referenceKeys.all, 'groups'] as const,
};

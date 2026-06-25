export const referenceKeys = {
  all: ['reference'] as const,
  courses: () => [...referenceKeys.all, 'courses'] as const,
  formats: () => [...referenceKeys.all, 'formats'] as const,
  types: () => [...referenceKeys.all, 'types'] as const,
  statuses: () => [...referenceKeys.all, 'statuses'] as const,
  groups: () => [...referenceKeys.all, 'groups'] as const,
};

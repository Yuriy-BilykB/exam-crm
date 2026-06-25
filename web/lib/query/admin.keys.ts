export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  managers: (page: number) => [...adminKeys.all, 'managers', page] as const,
  managerStats: (id: number) => [...adminKeys.all, 'manager-stats', id] as const,
};

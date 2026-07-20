
export const CourseNameList = ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'] as const;
export type CourseName = (typeof CourseNameList)[number];
export const CourseNameLabels: Record<CourseName, string> = {
  FS: 'FS',
  QACX: 'QACX',
  JCX: 'JCX',
  JSCX: 'JSCX',
  FE: 'FE',
  PCX: 'PCX',
};

export const OrderStatusList = ['In work', 'New', 'Agree', 'Disagree', 'Dubbing'] as const;
export type OrderStatus = (typeof OrderStatusList)[number];
export const OrderStatusLabels: Record<OrderStatus, string> = {
  'In work': 'In work',
  New: 'New',
  Agree: 'Agree',
  Disagree: 'Disagree',
  Dubbing: 'Dubbing',
};

export const CourseFormatList = ['static', 'online'] as const;
export type CourseFormat = (typeof CourseFormatList)[number];
export const CourseFormatLabels: Record<CourseFormat, string> = {
  static: 'Static',
  online: 'Online',
};

export const CourseTypeList = ['pro', 'minimal', 'premium', 'incubator', 'vip'] as const;
export type CourseType = (typeof CourseTypeList)[number];
export const CourseTypeLabels: Record<CourseType, string> = {
  pro: 'Pro',
  minimal: 'Minimal',
  premium: 'Premium',
  incubator: 'Incubator',
  vip: 'VIP',
};

function makeGuard<T extends string>(list: readonly T[]) {
  const set: ReadonlySet<string> = new Set(list);
  return (value: string): value is T => set.has(value);
}

export const isOrderStatus = makeGuard(OrderStatusList);
export const isCourseName = makeGuard(CourseNameList);
export const isCourseFormat = makeGuard(CourseFormatList);
export const isCourseType = makeGuard(CourseTypeList);

export function statusLabel(statusName: string): string {
  const labels: Record<string, string> = OrderStatusLabels;
  return labels[statusName] ?? statusName;
}

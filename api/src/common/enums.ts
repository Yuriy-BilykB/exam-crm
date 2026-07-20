export { Role, TokenType } from '../generated/prisma/enums';

import { Role } from '../generated/prisma/enums';

export const UserRole = {
  ADMIN: Role.admin,
  MANAGER: Role.manager,
} as const;
export type UserRole = Role;

export const CourseValues = ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'] as const;
export const CourseFormatValues = ['static', 'online'] as const;
export const CourseTypeValues = [
  'pro',
  'minimal',
  'premium',
  'incubator',
  'vip',
] as const;
export const OrderStatusValues = [
  'In work',
  'New',
  'Agree',
  'Disagree',
  'Dubbing',
] as const;

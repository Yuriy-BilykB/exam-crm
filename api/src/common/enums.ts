// Central re-export of Prisma-generated enums plus a couple of app-facing aliases.
// Prisma 7 emits enums as `const` objects (value type = string union), so these
// work both as runtime values and as TS types.
export {
  Role,
  CourseName,
  CourseType,
  CourseFormat,
  ApplicationStatus,
  TokenType,
} from '../generated/prisma/enums';

import { Role } from '../generated/prisma/enums';

/**
 * Back-compat alias used across the app as `UserRole.ADMIN` / `UserRole.MANAGER`.
 * Values are the same strings Prisma stores ('admin' | 'manager').
 */
export const UserRole = {
  ADMIN: Role.admin,
  MANAGER: Role.manager,
} as const;
export type UserRole = Role;

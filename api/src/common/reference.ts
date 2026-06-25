// Reference data + mapping helpers.
//
// In the normalized schema, `format`, `type` and `status` are enums rather than
// their own tables. The frontend, however, still expects `{ id, name }` reference
// lists (GET /course-formats, /course-types, /statuses) and embedded `{ id, name }`
// objects on each application. We synthesize stable ids here and map between the
// frontend ids/names and the Prisma enum values.

import {
  ApplicationStatus,
  CourseFormat,
  CourseType,
} from '../generated/prisma/enums';

export interface RefItem<T> {
  id: number;
  name: string;
  value: T;
}

export const STATUS_REF: RefItem<ApplicationStatus>[] = [
  { id: 1, name: 'In work', value: ApplicationStatus.InWork },
  { id: 2, name: 'New', value: ApplicationStatus.New },
  { id: 3, name: 'Agree', value: ApplicationStatus.Agree },
  { id: 4, name: 'Disaggre', value: ApplicationStatus.Disaggre },
  { id: 5, name: 'Dubbing', value: ApplicationStatus.Dubbing },
];

export const FORMAT_REF: RefItem<CourseFormat>[] = [
  { id: 1, name: 'static', value: CourseFormat.static },
  { id: 2, name: 'online', value: CourseFormat.online },
];

export const TYPE_REF: RefItem<CourseType>[] = [
  { id: 1, name: 'pro', value: CourseType.pro },
  { id: 2, name: 'minimal', value: CourseType.minimal },
  { id: 3, name: 'premium', value: CourseType.premium },
  { id: 4, name: 'incubator', value: CourseType.incubator },
  { id: 5, name: 'vip', value: CourseType.vip },
];

// ---- status ----
export function statusRef(value: ApplicationStatus | null | undefined) {
  if (!value) return null;
  return STATUS_REF.find((s) => s.value === value) ?? null;
}
export function statusValueById(id?: string | number | null): ApplicationStatus | undefined {
  if (id == null || id === '') return undefined;
  return STATUS_REF.find((s) => s.id === Number(id))?.value;
}
export function statusValueByName(name?: string | null): ApplicationStatus | undefined {
  if (!name) return undefined;
  return STATUS_REF.find((s) => s.name === name)?.value;
}

// ---- format ----
export function formatRef(value: CourseFormat | null | undefined) {
  if (!value) return null;
  return FORMAT_REF.find((f) => f.value === value) ?? null;
}
export function formatValueById(id?: string | number | null): CourseFormat | undefined {
  if (id == null || id === '') return undefined;
  return FORMAT_REF.find((f) => f.id === Number(id))?.value;
}

// ---- type ----
export function typeRef(value: CourseType | null | undefined) {
  if (!value) return null;
  return TYPE_REF.find((t) => t.value === value) ?? null;
}
export function typeValueById(id?: string | number | null): CourseType | undefined {
  if (id == null || id === '') return undefined;
  return TYPE_REF.find((t) => t.id === Number(id))?.value;
}

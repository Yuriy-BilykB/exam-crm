import { z } from 'zod';
import {
  OrderStatusList,
  CourseNameList,
  CourseFormatList,
  CourseTypeList,
} from '@/lib/reference/lists';

const digits = z.string().trim().regex(/^\d*$/, 'Digits only');
const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === '' || z.email().safeParse(v).success, 'Enter a valid email');
const optionalOneOf = <T extends readonly [string, ...string[]]>(list: T) =>
  z.union([z.literal(''), z.enum(list)]);

export const editOrderSchema = z.object({
  name: z.string().trim(),
  surname: z.string().trim(),
  email: optionalEmail,
  phone: z.string().trim(),
  age: digits,
  sum: digits,
  alreadyPaid: digits,
  status: optionalOneOf(OrderStatusList),
  course: optionalOneOf(CourseNameList),
  courseFormat: optionalOneOf(CourseFormatList),
  courseType: optionalOneOf(CourseTypeList),
  groupId: z.string(),
});

export type EditOrderFormValues = z.infer<typeof editOrderSchema>;

import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs';
import type { OrderListParams } from '@/services/orders.service';
import {
  isOrderStatus,
  isCourseName,
  isCourseFormat,
  isCourseType,
} from '@/lib/reference/lists';

export const ORDERS_PAGE_LIMIT = 25;
export const ORDERS_FILTER_DEBOUNCE_MS = 400;

export type SortOrder = 'ASC' | 'DESC';

export const orderSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringEnum<SortOrder>(['ASC', 'DESC']).withDefault('DESC'),
  name: parseAsString.withDefault(''),
  surname: parseAsString.withDefault(''),
  email: parseAsString.withDefault(''),
  phone: parseAsString.withDefault(''),
  age: parseAsString.withDefault(''),
  status: parseAsString.withDefault(''),
  course: parseAsString.withDefault(''),
  format: parseAsString.withDefault(''),
  type: parseAsString.withDefault(''),
  group_id: parseAsString.withDefault(''),
  startDate: parseAsString.withDefault(''),
  endDate: parseAsString.withDefault(''),
  my_orders: parseAsBoolean.withDefault(false),
};

export type OrderSearchParams = {
  page: number;
  sortBy: string;
  sortOrder: SortOrder;
  name: string;
  surname: string;
  email: string;
  phone: string;
  age: string;
  status: string;
  course: string;
  format: string;
  type: string;
  group_id: string;
  startDate: string;
  endDate: string;
  my_orders: boolean;
};

export function toOrderListParams(params: OrderSearchParams): OrderListParams {
  const listParams: OrderListParams = {
    page: params.page,
    limit: ORDERS_PAGE_LIMIT,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  };

  if (params.name) {listParams.name = params.name;}
  if (params.surname) {listParams.surname = params.surname;}
  if (params.email) {listParams.email = params.email;}
  if (params.phone) {listParams.phone = params.phone;}
  if (params.age !== '' && !Number.isNaN(Number(params.age))) {
    listParams.age = Number(params.age);
  }
  if (isOrderStatus(params.status)) {listParams.status = params.status;}
  if (isCourseName(params.course)) {listParams.course = params.course;}
  if (isCourseFormat(params.format)) {listParams.format = params.format;}
  if (isCourseType(params.type)) {listParams.type = params.type;}
  if (params.group_id) {listParams.group_id = params.group_id;}
  if (params.startDate) {listParams.startDate = params.startDate;}
  if (params.endDate) {listParams.endDate = params.endDate;}
  if (params.my_orders) {listParams.my_orders = true;}

  return listParams;
}

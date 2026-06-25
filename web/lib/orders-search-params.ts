import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs';
import type { OrderListParams } from '@/services/orders.service';

export const ORDERS_PAGE_LIMIT = 25;
export const ORDERS_FILTER_DEBOUNCE_MS = 400;

export type SortOrder = 'ASC' | 'DESC';

export const orderSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  sortBy: parseAsString.withDefault('created_at'),
  sortOrder: parseAsStringEnum<SortOrder>(['ASC', 'DESC']).withDefault('DESC'),
  name: parseAsString.withDefault(''),
  surname: parseAsString.withDefault(''),
  email: parseAsString.withDefault(''),
  phone: parseAsString.withDefault(''),
  status_id: parseAsString.withDefault(''),
  format_id: parseAsString.withDefault(''),
  type_id: parseAsString.withDefault(''),
  group_id: parseAsString.withDefault(''),
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
  status_id: string;
  format_id: string;
  type_id: string;
  group_id: string;
  my_orders: boolean;
};

export function toOrderListParams(params: OrderSearchParams): OrderListParams {
  const listParams: OrderListParams = {
    page: params.page,
    limit: ORDERS_PAGE_LIMIT,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  };

  if (params.name) listParams.name = params.name;
  if (params.surname) listParams.surname = params.surname;
  if (params.email) listParams.email = params.email;
  if (params.phone) listParams.phone = params.phone;
  if (params.status_id) listParams.status_id = params.status_id;
  if (params.format_id) listParams.format_id = params.format_id;
  if (params.type_id) listParams.type_id = params.type_id;
  if (params.group_id) listParams.group_id = params.group_id;
  if (params.my_orders) listParams.my_orders = true;

  return listParams;
}

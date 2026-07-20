'use client';

import { useMemo} from 'react';
import { useQueryStates } from 'nuqs';
import {
  ORDERS_FILTER_DEBOUNCE_MS,
  orderSearchParamsParsers,
  toOrderListParams,
} from '@/lib/orders-search-params';
import { useDebouncedValue } from './useDebouncedValue';


export function useOrderSearchParams() {
  const [params, setParams] = useQueryStates(orderSearchParamsParsers, {
    history: 'push',
  });

  const debouncedName = useDebouncedValue(params.name, ORDERS_FILTER_DEBOUNCE_MS);
  const debouncedSurname = useDebouncedValue(params.surname, ORDERS_FILTER_DEBOUNCE_MS);
  const debouncedEmail = useDebouncedValue(params.email, ORDERS_FILTER_DEBOUNCE_MS);
  const debouncedPhone = useDebouncedValue(params.phone, ORDERS_FILTER_DEBOUNCE_MS);
  const debouncedAge = useDebouncedValue(params.age, ORDERS_FILTER_DEBOUNCE_MS);

  const listParams = useMemo(
    () =>
      toOrderListParams({
        ...params,
        name: debouncedName,
        surname: debouncedSurname,
        email: debouncedEmail,
        phone: debouncedPhone,
        age: debouncedAge,
      }),
    [
      params,
      debouncedName,
      debouncedSurname,
      debouncedEmail,
      debouncedPhone,
      debouncedAge,
    ],
  );

  const resetFilters = () => {
    setParams({
      page: 1,
      name: '',
      surname: '',
      email: '',
      phone: '',
      age: '',
      status: '',
      course: '',
      format: '',
      type: '',
      group_id: '',
      startDate: '',
      endDate: '',
      my_orders: false,
    });
  };

  return { params, setParams, listParams, resetFilters };
}

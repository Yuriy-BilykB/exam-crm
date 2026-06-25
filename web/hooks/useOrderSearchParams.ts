'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryStates } from 'nuqs';
import {
  ORDERS_FILTER_DEBOUNCE_MS,
  orderSearchParamsParsers,
  toOrderListParams,
} from '@/lib/orders-search-params';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useOrderSearchParams() {
  const [params, setParams] = useQueryStates(orderSearchParamsParsers, {
    history: 'push',
  });

  const debouncedName = useDebouncedValue(params.name, ORDERS_FILTER_DEBOUNCE_MS);
  const debouncedSurname = useDebouncedValue(params.surname, ORDERS_FILTER_DEBOUNCE_MS);
  const debouncedEmail = useDebouncedValue(params.email, ORDERS_FILTER_DEBOUNCE_MS);
  const debouncedPhone = useDebouncedValue(params.phone, ORDERS_FILTER_DEBOUNCE_MS);

  const listParams = useMemo(
    () =>
      toOrderListParams({
        ...params,
        name: debouncedName,
        surname: debouncedSurname,
        email: debouncedEmail,
        phone: debouncedPhone,
      }),
    [params, debouncedName, debouncedSurname, debouncedEmail, debouncedPhone],
  );

  const resetFilters = () => {
    setParams({
      page: 1,
      name: '',
      surname: '',
      email: '',
      phone: '',
      status_id: '',
      format_id: '',
      type_id: '',
      group_id: '',
      my_orders: false,
    });
  };

  return { params, setParams, listParams, resetFilters };
}

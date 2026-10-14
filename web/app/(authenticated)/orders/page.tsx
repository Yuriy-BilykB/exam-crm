'use client';

import OrdersContainer from '@/components/OrdersContainer';
import OrdersFilters from '@/components/OrdersFilters';
import { RefreshIcon } from '@/components/icons';
import { useOrdersList } from '@/hooks/orders/useOrdersList';
import { useGroups } from '@/hooks/reference/useReferences';
import { useOrderSearchParams } from '@/hooks/useOrderSearchParams';
import { getApiErrorMessage } from '@/lib/api/errors';

export default function OrdersPage() {
  const { params, setParams, listParams } = useOrderSearchParams();

  const { data, error, isError, isPending, isFetching, refetch } =
    useOrdersList(listParams);
  const { data: groups = [] } = useGroups();

  return (
    <>
      <OrdersFilters
        groups={groups}
        onRefresh={() => {
          void refetch();
        }}
        isRefreshing={isFetching}
      />

      {isPending ? (
        <div role="status" className="text-gray-600">
          Loading orders...
        </div>
      ) : isError || !data ? (
        <div
          role="alert"
          className="border-l-4 border-red-600 bg-red-50 p-4 text-red-900"
        >
          <p className="font-semibold">Could not load orders</p>
          <p className="mt-1 text-sm">
            {getApiErrorMessage(error, 'Please try again.')}
          </p>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
            className="mt-3 inline-flex items-center gap-2 bg-white border border-red-300 px-3 py-1.5 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
          >
            <RefreshIcon className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : (
        <OrdersContainer data={data} params={params} setParams={setParams} />
      )}
    </>
  );
}

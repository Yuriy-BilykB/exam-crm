import { keepPreviousData, useQuery, UseQueryOptions } from '@tanstack/react-query';


type Props<TParams, TData, Tkey> = {
  params: TParams
  queryKey: Tkey[]
  fetchData: (params: TParams) => Promise<TData>
  options?: Omit<
    UseQueryOptions<TData>,
    'queryKey' | 'queryFn'
  >
}


export const useFetch = <TParams, TData, Tkey> ({params, queryKey, fetchData, options}: Props<TParams, TData, Tkey>) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetchData(params),
    placeholderData: keepPreviousData,
    ...options
  });
};

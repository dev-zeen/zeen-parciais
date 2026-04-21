import { useQuery } from '@tanstack/react-query';

import { GET_MARKET, GET_MARKET_STATUS } from '@/constants/Endpoits';
import { Market, MarketStatus } from '@/models/Market';
import api from '@/services/api';

export const useGetMarketStatus = () =>
  useQuery<MarketStatus>({
    queryKey: [GET_MARKET_STATUS],
    queryFn: () => api.get<MarketStatus>(GET_MARKET_STATUS).then((r) => r.data),
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
  });

export const useGetMarket = () =>
  useQuery<Market>({
    queryKey: [GET_MARKET],
    queryFn: () => api.get<Market>(GET_MARKET).then((r) => r.data),
  });

import { GET_MARKET, GET_MARKET_STATUS } from "@/constants/Endpoits";
import { Market, MarketStatus } from "@/models/Market";
import { useFetch } from "@/utils/reactQuery";

export const useGetMarketStatus = () =>
  useFetch<MarketStatus>(GET_MARKET_STATUS, undefined, {
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
  });

export const useGetMarket = () => useFetch<Market>(GET_MARKET);

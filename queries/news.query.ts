import { useQuery } from '@tanstack/react-query';

import { GET_NEWS, GET_NEWS_GATO_MESTRE } from '@/constants/Endpoits';
import { NewsItem, NewsSource } from '@/models/News';
import api from '@/services/api';

const NEWS_URL: Record<NewsSource, string> = {
  cartola: GET_NEWS,
  gatomestre: GET_NEWS_GATO_MESTRE,
};

/** Notícias e dicas; mudam pouco, então ficam 30 min em cache. */
export const useGetNews = (source: NewsSource, enabled: boolean) =>
  useQuery<NewsItem[]>({
    queryKey: [NEWS_URL[source]],
    queryFn: () =>
      api
        .get<NewsItem[] | null>(NEWS_URL[source])
        .then((r) => (Array.isArray(r.data) ? r.data : [])),
    enabled,
    staleTime: 30 * 60 * 1000,
  });

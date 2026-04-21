import { useQuery } from '@tanstack/react-query';

import { MATCHES_ACTUAL_ROUND } from '@/constants/Endpoits';
import { Matches } from '@/models/Matches';
import api from '@/services/api';

export const useGetMatchs = () =>
  useQuery<Matches>({
    queryKey: [MATCHES_ACTUAL_ROUND],
    queryFn: () => api.get<Matches>(MATCHES_ACTUAL_ROUND).then((r) => r.data),
  });

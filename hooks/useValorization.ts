import { useEffect, useMemo, useState } from 'react';

import { APPRECIATIONS } from '@/constants/Keys';
import useMarketStatus from '@/hooks/useMarketStatus';
import { Appreciations } from '@/models/Player';
import { useGetMarket } from '@/queries/market.query';
import { useGetAppreciations } from '@/queries/players.query';
import { onGetFromStorage } from '@/utils/asyncStorage';

const useValorization = () => {
  const { isMarketClose, allowRequest } = useMarketStatus();

  const { data: market } = useGetMarket();

  const {
    isLoading: isLoadingValorizations,
    refetch: onRefetchValorizations,
    isRefetching: isRefetchingValorizations,
  } = useGetAppreciations(!!allowRequest);

  const [storedValorizations, setStoredValorizations] = useState<Appreciations | null>(null);
  const [isStorageLoading, setIsStorageLoading] = useState(isMarketClose);

  useEffect(() => {
    if (!isMarketClose) {
      setIsStorageLoading(false);
      return;
    }
    onGetFromStorage<Appreciations>(APPRECIATIONS).then((res) => {
      setStoredValorizations(res ?? null);
      setIsStorageLoading(false);
    });
  }, [isMarketClose]);

  const valorizations = useMemo<Appreciations | undefined>(() => {
    if (isMarketClose && storedValorizations) return storedValorizations;

    return market?.atletas
      .filter((a) => a.entrou_em_campo)
      .reduce(
        (acc, a) => ({
          ...acc,
          atletas: {
            ...acc.atletas,
            [a.atleta_id]: {
              posicao_id: a.posicao_id,
              variacao_num: a.variacao_num,
            },
          },
        }),
        { atletas: {} } as Appreciations
      );
  }, [isMarketClose, storedValorizations, market?.atletas]);

  return {
    valorizations,
    isLoadingValorizations: isLoadingValorizations || isStorageLoading,
    onRefetchValorizations: allowRequest ? onRefetchValorizations : () => null,
    isRefetchingValorizations,
  };
};

export default useValorization;

import { useEffect, useMemo, useState } from 'react';

import { APPRECIATIONS } from '@/constants/Keys';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarketStatus from '@/hooks/useMarketStatus';
import { Appreciations } from '@/models/Player';
import { useGetMarket } from '@/queries/market.query';
import { useGetAppreciations } from '@/queries/players.query';
import { onGetFromStorage } from '@/utils/asyncStorage';

const useValorization = () => {
  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();

  const { data: market } = useGetMarket();

  const {
    data: valorizations,
    isLoading: isLoadingValorizations,
    refetch: onRefetchValorizations,
    isRefetching: isRefetchingValorizations,
  } = useGetAppreciations(!!allowRequest);

  const [currentValorizations, setCurrentValorizations] = useState<Appreciations | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO &&
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_ATUALIZACAO
    ) {
      onGetFromStorage<Appreciations>(APPRECIATIONS).then((res) => {
        if (isMarketClose && res) {
          setCurrentValorizations(res);
        } else {
          const newAppreciations = market?.atletas
            .filter((current) => current.entrou_em_campo)
            .reduce(
              (acc, current) => ({
                ...acc,
                atletas: {
                  ...acc.atletas,
                  [current?.atleta_id]: {
                    posicao_id: current?.posicao_id,
                    variacao_num: current?.variacao_num,
                  },
                },
              }),
              { atletas: {} } as Appreciations
            );

          setCurrentValorizations(newAppreciations);
        }

        setIsLoading(false);
      });
    }
  }, [marketStatus, isMarketClose, market]);

  return {
    valorizations:
      Object.keys(valorizations?.atletas ?? {}).length > 0
        ? isMarketClose
          ? valorizations
          : currentValorizations
        : undefined,
    isLoadingValorizations: useMemo(
      () => isLoadingValorizations || isLoading,
      [isLoading, isLoadingValorizations]
    ),
    onRefetchValorizations: !allowRequest ? () => null : onRefetchValorizations,
    isRefetchingValorizations: useMemo(
      () => isRefetchingValorizations,
      [isRefetchingValorizations]
    ),
  };
};

export default useValorization;

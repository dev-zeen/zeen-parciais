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

  const [currentValorizations, setCurrentValorizations] = useState<Appreciations>();

  useEffect(() => {
    if (
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO ||
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_ATUALIZACAO
    ) {
      onGetFromStorage<Appreciations>(APPRECIATIONS).then((res) => {
        if (isMarketClose && res) {
          setCurrentValorizations(res);
        } else {
          const newAppreciations = market?.atletas.reduce(
            (acc, current) => {
              if (current.entrou_em_campo) {
                return {
                  ...acc,
                  atletas: {
                    ...acc.atletas,
                    [current?.atleta_id]: {
                      posicao_id: current?.posicao_id,
                      variacao_num: current?.variacao_num,
                    },
                  },
                };
              } else {
                return {
                  ...acc,
                };
              }
            },
            {
              atletas: {},
            } as Appreciations
          );

          setCurrentValorizations(newAppreciations);
        }
      });
    }
  }, [marketStatus, isMarketClose, market]);

  return {
    valorizations: isMarketClose ? valorizations : currentValorizations,
    isLoadingValorizations: useMemo(() => isLoadingValorizations, [isLoadingValorizations]),
    onRefetchValorizations: !allowRequest ? () => null : onRefetchValorizations,
    isRefetchingValorizations: useMemo(
      () => isRefetchingValorizations,
      [isRefetchingValorizations]
    ),
  };
};

export default useValorization;

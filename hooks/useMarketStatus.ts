import { useContext, useMemo } from 'react';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { useGetMarketStatus } from '@/queries/market.query';

const useMarketStatus = () => {
  const { isAutheticated } = useContext(AuthContext);

  const {
    data: marketStatus,
    isLoading: isLoadingMarketStatus,
    isError: isErrorMarketStatus,
    refetch: onRefetchMarketStatus,
    isRefetching: isRefetchingMarketStatus,
  } = useGetMarketStatus();

  const isMarketClose = useMemo(
    () => marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO,
    [marketStatus?.status_mercado]
  );

  const allowRequest = useMemo(
    () =>
      isAutheticated &&
      marketStatus &&
      marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO,
    [isAutheticated, marketStatus]
  );

  const isBallRolling = useMemo(
    () => marketStatus?.bola_rolando ?? false,
    [marketStatus?.bola_rolando]
  );

  const currentRoundInfo = useMemo(() => {
    if (!marketStatus) return null;
    
    return {
      nome: marketStatus.nome_rodada,
      numero: marketStatus.rodada_atual,
      rodadaFinal: marketStatus.rodada_final,
      fechamento: {
        timestamp: marketStatus.fechamento.timestamp,
        data: new Date(marketStatus.fechamento.timestamp * 1000),
        dia: marketStatus.fechamento.dia,
        mes: marketStatus.fechamento.mes,
        ano: marketStatus.fechamento.ano,
        hora: marketStatus.fechamento.hora,
        minuto: marketStatus.fechamento.minuto,
      },
    };
  }, [marketStatus]);

  const leagueLimits = useMemo(() => {
    if (!marketStatus) return null;

    const pontosCorridos =
      marketStatus.pontos_corridos ?? marketStatus.limites_competicoes?.pontos_corridos;

    if (!pontosCorridos) return null;

    return {
      free: {
        criacao: pontosCorridos.free.criacao,
        participacao: pontosCorridos.free.participacao,
      },
      pro: {
        criacao: pontosCorridos.pro.criacao,
        participacao: pontosCorridos.pro.participacao,
      },
    };
  }, [marketStatus]);

  const favoriteLimits = useMemo(() => {
    if (!marketStatus) return null;
    
    return {
      free: marketStatus.max_atletas_favoritos_free,
      pro: marketStatus.max_atletas_favoritos_pro,
    };
  }, [marketStatus]);

  return {
    marketStatus,
    isLoadingMarketStatus,
    isErrorMarketStatus,
    onRefetchMarketStatus,
    isRefetchingMarketStatus,
    isMarketClose,
    allowRequest,
    isBallRolling,
    currentRoundInfo,
    leagueLimits,
    favoriteLimits,
  };
};

export default useMarketStatus;

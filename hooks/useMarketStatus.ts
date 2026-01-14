import { useContext, useMemo } from 'react';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { useGetMarketStatus } from '@/queries/market.query';

const useMarketStatus = () => {
  const { isAutheticated } = useContext(AuthContext);

  const {
    data: marketStatus,
    isLoading: isLoadingMarketStatus,
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
    
    // Check if user is PRO (would need to be determined from user context)
    // For now, returning both free and pro limits
    return {
      free: {
        criacao: marketStatus.limites_competicoes.pontos_corridos.free.criacao,
        participacao: marketStatus.limites_competicoes.pontos_corridos.free.participacao,
      },
      pro: {
        criacao: marketStatus.limites_competicoes.pontos_corridos.pro.criacao,
        participacao: marketStatus.limites_competicoes.pontos_corridos.pro.participacao,
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

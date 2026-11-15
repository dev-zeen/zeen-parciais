import { useCallback } from 'react';
import { Alert } from 'react-native';

import useMarketStatus from '@/hooks/useMarketStatus';
import {
  useGetPointsCompetitionInvites,
  useRespondPointsCompetitionInvite,
} from '@/queries/competitionsInvites.query';
import { haptics } from '@/utils/haptics';

const EMPTY: never[] = [];

const usePointsCompetitionInvites = () => {
  const { allowRequest } = useMarketStatus();

  const { data, isLoading, refetch, isRefetching } = useGetPointsCompetitionInvites(allowRequest);

  const {
    mutate: respondInvite,
    isPending,
    variables,
  } = useRespondPointsCompetitionInvite({
    // Sucesso: o convite sai da lista (a mutação espera a lista atualizar)
    onSuccess: () => haptics.success(),
    onError: (error) => {
      haptics.error();
      const message =
        typeof error?.response?.data?.mensagem === 'string'
          ? error.response.data.mensagem
          : 'Não foi possível responder o convite. Confira a conexão e tente de novo.';
      Alert.alert('Convite não respondido', message);
    },
  });

  const handleAccept = useCallback(
    (messageId: number) => respondInvite({ messageId, decision: 'accept' }),
    [respondInvite]
  );

  const handleDecline = useCallback(
    (messageId: number) => respondInvite({ messageId, decision: 'decline' }),
    [respondInvite]
  );

  return {
    invites: data ?? EMPTY,
    isLoading,
    refetch,
    isRefetching,
    /** Convite sendo respondido agora, para bloquear o card e mostrar progresso */
    pending: isPending && variables ? variables : undefined,
    handleAccept,
    handleDecline,
  };
};

export default usePointsCompetitionInvites;

import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import useMarketStatus from '@/hooks/useMarketStatus';
import {
  useGetPointsCompetitionInvites,
  useRespondPointsCompetitionInvite,
} from '@/queries/competitionsInvites.query';

const usePointsCompetitionInvites = () => {
  const { allowRequest } = useMarketStatus();

  const { data, isLoading, refetch, isRefetching } = useGetPointsCompetitionInvites(allowRequest);

  const alertResponse = (title: string, subtitle: string) => {
    return Alert.alert(title, subtitle, [{ text: 'Ok', style: 'cancel' }]);
  };

  const { mutate: respondInvite } = useRespondPointsCompetitionInvite({
    onSuccess: (data, variables) => {
      const message =
        typeof data?.mensagem === 'string'
          ? data.mensagem
          : variables.decision === 'accept'
            ? 'Convite aceito!'
            : 'Convite recusado!';
      alertResponse('Tudo Certo!', message);
    },
    onError: (error) => {
      const message =
        typeof error?.response?.data?.mensagem === 'string'
          ? error.response.data.mensagem
          : 'Não foi possível responder o convite.';
      alertResponse('Alerta!', message);
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
    invites: useMemo(() => data ?? [], [data]),
    isLoading: useMemo(() => isLoading, [isLoading]),
    refetch: useMemo(() => refetch, [refetch]),
    isRefetching: useMemo(() => isRefetching, [isRefetching]),
    handleAccept,
    handleDecline,
  };
};

export default usePointsCompetitionInvites;


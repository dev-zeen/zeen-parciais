import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import { GET_ALL_LEAGUES, GET_POINTS_COMPETITIONS, INVITES, INVITES_POINTS_COMPETITIONS } from '@/constants/Endpoits';
import useMarketStatus from '@/hooks/useMarketStatus';
import {
  onRespondPointsCompetitionInvite,
  useGetPointsCompetitionInvites,
} from '@/queries/competitionsInvites.query';

const usePointsCompetitionInvites = () => {
  const { allowRequest } = useMarketStatus();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useGetPointsCompetitionInvites(allowRequest);

  const alertResponse = (title: string, subtitle: string) => {
    return Alert.alert(title, subtitle, [
      {
        text: 'Ok',
        style: 'cancel',
      },
    ]);
  };

  const handleRespond = useCallback(
    async (messageId: number, decision: 'accept' | 'decline') => {
      try {
        const response = await onRespondPointsCompetitionInvite({ messageId, decision });
        const message =
          typeof (response.data as any)?.mensagem === 'string'
            ? (response.data as any).mensagem
            : decision === 'accept'
              ? 'Convite aceito!'
              : 'Convite recusado!';
        alertResponse('Tudo Certo!', message);
      } catch (err: any) {
        const message =
          typeof err?.response?.data?.mensagem === 'string'
            ? err.response.data.mensagem
            : 'Não foi possível responder o convite.';
        alertResponse('Alerta!', message);
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [INVITES] }),
          queryClient.invalidateQueries({ queryKey: [INVITES_POINTS_COMPETITIONS] }),
          queryClient.invalidateQueries({ queryKey: [GET_POINTS_COMPETITIONS] }),
          queryClient.invalidateQueries({ queryKey: [GET_ALL_LEAGUES] }),
        ]);
      }
    },
    [queryClient]
  );

  const handleAccept = useCallback(
    async (messageId: number) => handleRespond(messageId, 'accept'),
    [handleRespond]
  );

  const handleDecline = useCallback(
    async (messageId: number) => handleRespond(messageId, 'decline'),
    [handleRespond]
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


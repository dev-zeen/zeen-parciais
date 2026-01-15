import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import { GET_ALL_LEAGUES, INVITES, INVITES_POINTS_COMPETITIONS } from '@/constants/Endpoits';
import useMarketStatus from '@/hooks/useMarketStatus';
import { onAcceptInvite, onDeclineInvitation, useGetInvites } from '@/queries/invites.query';

const useInvites = () => {
  const { allowRequest } = useMarketStatus();
  const queryClient = useQueryClient();

  const {
    data: invites,
    isLoading: isLoadingInvites,
    refetch: onRefetchInvites,
    isRefetching: isRefetchingInvites,
  } = useGetInvites(allowRequest);

  const alertResponseInvite = (title: string, subtitle: string) => {
    return Alert.alert(title, subtitle, [
      {
        text: 'Ok',
        style: 'cancel',
      },
    ]);
  };

  const onRefetch = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [INVITES] }),
      queryClient.invalidateQueries({ queryKey: [INVITES_POINTS_COMPETITIONS] }),
      queryClient.invalidateQueries({ queryKey: [GET_ALL_LEAGUES] }),
    ]);
  }, [queryClient]);

  const handleAcceptInvite = useCallback(
    async (messageId: number) => {
      await onAcceptInvite(String(messageId))
        .then((response) => {
          alertResponseInvite('Tudo Certo!', response.data.mensagem);
        })
        .catch((err: any) =>
          alertResponseInvite('Alerta!', err?.response?.data?.mensagem as string)
        );

      await onRefetch();
    },
    [onRefetch]
  );

  const handleDeclineInvitation = useCallback(
    async (messageId: number) => {
      await onDeclineInvitation(String(messageId))
        .then((response) => {
          alertResponseInvite('Tudo Certo!', response.data.mensagem);
        })
        .catch((err: any) =>
          alertResponseInvite('Alerta!', err?.response?.data?.mensagem as string)
        );

      await onRefetch();
    },
    [onRefetch]
  );

  return {
    invites: useMemo(() => invites, [invites]),
    isLoadingInvites: useMemo(() => isLoadingInvites, [isLoadingInvites]),
    onRefetchInvites: useMemo(() => onRefetchInvites, [onRefetchInvites]),
    isRefetchingInvites: useMemo(() => isRefetchingInvites, [isRefetchingInvites]),
    handleAcceptInvite,
    handleDeclineInvitation,
  };
};

export default useInvites;

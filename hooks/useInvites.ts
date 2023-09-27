import { useCallback } from 'react';
import { Alert } from 'react-native';

import useMarketStatus from '@/hooks/useMarketStatus';
import { onAcceptInvite, onDeclineInvitation, useGetInvites } from '@/queries/invites.query';

const useInvites = () => {
  const { allowRequest } = useMarketStatus();

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
    await Promise.all([onRefetchInvites()]);
  }, [onRefetchInvites]);

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
    invites,
    isLoadingInvites,
    onRefetchInvites,
    isRefetchingInvites,
    handleAcceptInvite,
    handleDeclineInvitation,
  };
};

export default useInvites;

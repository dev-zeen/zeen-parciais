import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import useMarketStatus from '@/hooks/useMarketStatus';
import { useAcceptInvite, useDeclineInvitation, useGetInvites } from '@/queries/invites.query';

const useInvites = () => {
  const { allowRequest } = useMarketStatus();

  const {
    data: invites,
    isLoading: isLoadingInvites,
    refetch: onRefetchInvites,
    isRefetching: isRefetchingInvites,
  } = useGetInvites(allowRequest);

  const alertResponseInvite = (title: string, subtitle: string) => {
    return Alert.alert(title, subtitle, [{ text: 'Ok', style: 'cancel' }]);
  };

  const { mutate: acceptInvite } = useAcceptInvite({
    onSuccess: (data) => alertResponseInvite('Tudo Certo!', data.mensagem),
    onError: (error) =>
      alertResponseInvite('Alerta!', error?.response?.data?.mensagem as string),
  });

  const { mutate: declineInvite } = useDeclineInvitation({
    onSuccess: (data) => alertResponseInvite('Tudo Certo!', data.mensagem),
    onError: (error) =>
      alertResponseInvite('Alerta!', error?.response?.data?.mensagem as string),
  });

  const handleAcceptInvite = useCallback(
    (messageId: number) => acceptInvite(String(messageId)),
    [acceptInvite]
  );

  const handleDeclineInvitation = useCallback(
    (messageId: number) => declineInvite(String(messageId)),
    [declineInvite]
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

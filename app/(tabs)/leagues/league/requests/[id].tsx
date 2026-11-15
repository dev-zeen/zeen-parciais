import { useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, RefreshControl, View } from 'react-native';

import { InviteCard } from '@/components/contexts/leagues/InviteCard';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { StateView } from '@/components/ui/StateView';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import { Invite } from '@/models/Invites';
import { useAcceptInvite, useDeclineInvitation } from '@/queries/invites.query';
import { useGetLeague } from '@/queries/leagues.query';
import { haptics } from '@/utils/haptics';

const keyExtractor = (item: Invite) => `${item.mensagem_id}`;

const showError = (message?: string) => {
  haptics.error();
  Alert.alert(
    'Pedido não respondido',
    message ?? 'Não foi possível responder o pedido. Confira a conexão e tente de novo.'
  );
};

/** Pedidos para entrar na liga (só o dono chega aqui). */
export default function LeagueRequestsScreen() {
  const { spacing } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allowRequest } = useMarketStatus();

  const {
    data: league,
    isLoading,
    refetch: onRefetchLeague,
    isRefetching,
  } = useGetLeague(id ?? '', allowRequest);

  // A liga é buscada de novo depois da resposta, para o pedido sair da lista.
  const accept = useAcceptInvite({
    onSuccess: () => {
      haptics.success();
      return onRefetchLeague();
    },
    onError: (error) => showError(error?.response?.data?.mensagem),
  });
  const decline = useDeclineInvitation({
    onSuccess: () => {
      haptics.selection();
      return onRefetchLeague();
    },
    onError: (error) => showError(error?.response?.data?.mensagem),
  });

  if (isLoading) return <LoadingScreen title="Carregando pedidos" />;

  const requests = league?.pedidos ?? [];

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader title="Pedidos para entrar" subtitle={league?.liga.nome} />
      <FlatList
        data={requests}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => {
          const messageId = String(item.mensagem_id);
          return (
            <InviteCard
              title={item.time?.nome ?? 'Time'}
              subtitle={item.time?.nome_cartola}
              date={item.data}
              imageUrl={item.time?.url_escudo_png}
              roundImage
              pending={
                accept.isPending && accept.variables === messageId
                  ? 'accept'
                  : decline.isPending && decline.variables === messageId
                    ? 'decline'
                    : undefined
              }
              onAccept={() => accept.mutate(messageId)}
              onDecline={() => decline.mutate(messageId)}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.md,
          paddingBottom: tabBarSpacing.contentBottom,
        }}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              onRefetchLeague();
            }}
            refreshing={isRefetching}
          />
        }
        ListEmptyComponent={
          <StateView
            icon="user-check"
            title="Nenhum pedido pendente"
            message="Quando alguém pedir para entrar na sua liga, o pedido aparece aqui."
          />
        }
      />
    </SafeAreaViewContainer>
  );
}

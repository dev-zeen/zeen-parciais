import { useCallback, useMemo } from 'react';
import { Alert, ListRenderItemInfo, RefreshControl, SectionList, View } from 'react-native';

import { InviteCard } from '@/components/contexts/leagues/InviteCard';
import { LEAGUE_KIND, PRIVACY_LABEL } from '@/components/contexts/leagues/leagueKinds';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { StateView } from '@/components/ui/StateView';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePointsCompetitionInvites from '@/hooks/usePointsCompetitionInvites';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import type { PointsCompetitionInvite } from '@/models/Competition';
import { Invite } from '@/models/Invites';
import { useAcceptInvite, useDeclineInvitation, useGetInvites } from '@/queries/invites.query';
import { haptics } from '@/utils/haptics';

type InviteRow =
  | { kind: 'league'; invite: Invite }
  | { kind: 'points'; invite: PointsCompetitionInvite };

type InviteSection = { title: string; data: InviteRow[] };

const showError = (message?: string) => {
  haptics.error();
  Alert.alert(
    'Convite não respondido',
    message ?? 'Não foi possível responder o convite. Confira a conexão e tente de novo.'
  );
};

const keyExtractor = (item: InviteRow) =>
  item.kind === 'league' ? `league-${item.invite.mensagem_id}` : `points-${item.invite.id}`;

export default function InvitesScreen() {
  const { spacing } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { allowRequest } = useMarketStatus();

  const {
    data: leagueInvites,
    isLoading: isLoadingLeagueInvites,
    isError: isErrorLeagueInvites,
    refetch: onRefetchLeagueInvites,
    isRefetching: isRefetchingLeagueInvites,
  } = useGetInvites(allowRequest);

  // Sucesso: o convite some da lista; a mutação só termina depois que a lista atualiza.
  const accept = useAcceptInvite({
    onSuccess: () => haptics.success(),
    onError: (error) => showError(error?.response?.data?.mensagem),
  });
  const decline = useDeclineInvitation({
    onSuccess: () => haptics.selection(),
    onError: (error) => showError(error?.response?.data?.mensagem),
  });

  const {
    invites: pointsInvites,
    isLoading: isLoadingPointsInvites,
    refetch: onRefetchPointsInvites,
    isRefetching: isRefetchingPointsInvites,
    pending: pointsPending,
    handleAccept: handleAcceptPointsInvite,
    handleDecline: handleDeclinePointsInvite,
  } = usePointsCompetitionInvites();

  const sections = useMemo(() => {
    const result: InviteSection[] = [];
    const leagueRows: InviteRow[] =
      leagueInvites?.convites?.map((invite) => ({ kind: 'league', invite })) ?? [];
    const pointsRows: InviteRow[] = pointsInvites.map((invite) => ({ kind: 'points', invite }));
    if (leagueRows.length) result.push({ title: 'Clássicas e mata-mata', data: leagueRows });
    if (pointsRows.length) result.push({ title: 'Pontos corridos', data: pointsRows });
    return result;
  }, [leagueInvites?.convites, pointsInvites]);

  const total = sections.reduce((sum, section) => sum + section.data.length, 0);

  // Só o card que está sendo respondido fica bloqueado; os demais seguem disponíveis.
  const leaguePending = (id: number): 'accept' | 'decline' | undefined =>
    accept.isPending && accept.variables === String(id)
      ? 'accept'
      : decline.isPending && decline.variables === String(id)
        ? 'decline'
        : undefined;

  const renderItem = ({ item }: ListRenderItemInfo<InviteRow>) => {
    if (item.kind === 'league') {
      const { invite } = item;
      const kind = LEAGUE_KIND[invite.liga?.mata_mata ? 'cup' : 'classic'];
      const privacy = invite.liga?.tipo ? PRIVACY_LABEL[invite.liga.tipo] : undefined;
      return (
        <InviteCard
          title={invite.liga?.nome ?? 'Convite'}
          badge={{ label: kind.label, tone: kind.tone }}
          subtitle={privacy}
          from={invite.time?.nome ? `Convite de ${invite.time.nome}` : undefined}
          date={invite.data}
          imageUrl={
            invite.liga?.imagem ??
            (invite.liga?.mata_mata ? invite.liga.url_trofeu_png : invite.liga?.url_flamula_png)
          }
          pending={leaguePending(invite.mensagem_id)}
          onAccept={() => accept.mutate(String(invite.mensagem_id))}
          onDecline={() => decline.mutate(String(invite.mensagem_id))}
        />
      );
    }

    const { invite } = item;
    const kind = LEAGUE_KIND.points;
    return (
      <InviteCard
        title={invite.competicao?.nome ?? 'Convite'}
        badge={{ label: kind.label, tone: kind.tone }}
        subtitle={
          invite.competicao?.privacidade ? PRIVACY_LABEL[invite.competicao.privacidade] : undefined
        }
        from={invite.remetente?.nome ? `Convite de ${invite.remetente.nome}` : undefined}
        date={invite.data}
        imageUrl={invite.competicao?.url_asset_png}
        pending={pointsPending?.messageId === invite.id ? pointsPending.decision : undefined}
        onAccept={() => handleAcceptPointsInvite(invite.id)}
        onDecline={() => handleDeclinePointsInvite(invite.id)}
      />
    );
  };

  const onRefetch = useCallback(async () => {
    await Promise.allSettled([onRefetchLeagueInvites(), onRefetchPointsInvites()]);
  }, [onRefetchLeagueInvites, onRefetchPointsInvites]);

  if (isLoadingLeagueInvites || isLoadingPointsInvites) {
    return <LoadingScreen title="Carregando convites" />;
  }

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader
        title="Convites"
        subtitle={
          total ? `${total} ${total === 1 ? 'convite pendente' : 'convites pendentes'}` : undefined
        }
      />
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        renderSectionHeader={({ section }) => (
          <AppText
            variant="label"
            weight="bold"
            color="textMuted"
            style={{ paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
            {section.title.toUpperCase()}
          </AppText>
        )}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.md,
          paddingBottom: tabBarSpacing.contentBottom,
        }}
        refreshControl={
          <RefreshControl
            onRefresh={onRefetch}
            refreshing={isRefetchingLeagueInvites || isRefetchingPointsInvites}
          />
        }
        ListEmptyComponent={
          isErrorLeagueInvites ? (
            <StateView
              icon="wifi-off"
              title="Não deu para carregar os convites"
              message="Confira a conexão e tente de novo."
              actionLabel="Tentar de novo"
              onAction={onRefetch}
            />
          ) : (
            <StateView
              icon="mail"
              title="Nenhum convite pendente"
              message="Quando alguém convidar seu time para uma liga, o convite aparece aqui."
            />
          )
        }
      />
    </SafeAreaViewContainer>
  );
}

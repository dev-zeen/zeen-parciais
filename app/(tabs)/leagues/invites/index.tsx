import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { 
  ListRenderItemInfo,
  RefreshControl,
  SectionList,
  TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { EmptyInviteList } from '@/components/contexts/leagues/EmptyInviteList';
import { InviteCard } from '@/components/contexts/leagues/InviteCard';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import useInvites from '@/hooks/useInvites';
import usePointsCompetitionInvites from '@/hooks/usePointsCompetitionInvites';
import type { PointsCompetitionInvite } from '@/models/Competition';
import { Invite } from '@/models/Invites';
import { useGetLeagues } from '@/queries/leagues.query';
import { useThemeColor } from '@/hooks/useThemeColor';

type InviteRow =
  | { kind: 'league'; invite: Invite }
  | { kind: 'points'; invite: PointsCompetitionInvite };

type InviteSection = {
  title: string;
  data: InviteRow[];
};

export default () => {
  const colorTheme = useThemeColor();

  const {
    invites: leagueInvites,
    isLoadingInvites: isLoadingLeagueInvites,
    onRefetchInvites: onRefetchLeagueInvites,
    isRefetchingInvites: isRefetchingLeagueInvites,
    handleAcceptInvite,
    handleDeclineInvitation,
  } = useInvites();

  const {
    invites: pointsInvites,
    isLoading: isLoadingPointsInvites,
    refetch: onRefetchPointsInvites,
    isRefetching: isRefetchingPointsInvites,
    handleAccept: handleAcceptPointsInvite,
    handleDecline: handleDeclinePointsInvite,
  } = usePointsCompetitionInvites();

  const invitesCount = useMemo(() => {
    return (leagueInvites?.convites?.length ?? 0) + (pointsInvites?.length ?? 0);
  }, [leagueInvites?.convites?.length, pointsInvites?.length]);

  const { refetch: onRefetchLeagues } = useGetLeagues();

  const onRefetch = useCallback(async () => {
    await Promise.allSettled([onRefetchLeagues(), onRefetchLeagueInvites(), onRefetchPointsInvites()]);
  }, [onRefetchLeagues, onRefetchLeagueInvites, onRefetchPointsInvites]);

  const sections: InviteSection[] = useMemo(() => {
    const s: InviteSection[] = [];

    const leagueRows: InviteRow[] =
      leagueInvites?.convites?.map((invite) => ({ kind: 'league', invite })) ?? [];
    const pointsRows: InviteRow[] = pointsInvites.map((invite) => ({ kind: 'points', invite }));

    if (leagueRows.length) s.push({ title: 'Clássicas e Mata-mata', data: leagueRows });
    if (pointsRows.length) s.push({ title: 'Pontos Corridos', data: pointsRows });

    return s;
  }, [leagueInvites?.convites, pointsInvites]);

  const keyExtractor = useCallback((item: InviteRow) => {
    if (item.kind === 'league') return `league-${item.invite.mensagem_id}`;
    return `points-${item.invite.id}`;
  }, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<InviteRow>) => {
    if (item.kind === 'league') {
      const invite = item.invite;
      const title = invite.liga?.nome ?? 'Convite';
      const typeLabel = invite.liga?.mata_mata ? 'Mata-mata' : 'Clássica';
      const privacyMap = { A: 'Aberta', M: 'Moderada', F: 'Fechada' };
      const privacy = invite.liga?.tipo ? privacyMap[invite.liga.tipo] : '';
      const subtitle = privacy ? `${typeLabel} · ${privacy}` : typeLabel;

      // A API de convites retorna o campo "imagem" com a URL já processada
      const imageUrl = invite.liga?.imagem ?? 
        (invite.liga?.mata_mata ? invite.liga.url_trofeu_png : invite.liga?.url_flamula_png);

      return (
        <InviteCard
          title={title}
          subtitle={subtitle}
          imageUrl={imageUrl}
          teamName={invite.time?.nome}
          onAccept={() => handleAcceptInvite(invite.mensagem_id)}
          onDecline={() => handleDeclineInvitation(invite.mensagem_id)}
        />
      );
    }

    const invite = item.invite;
    const title = invite.competicao?.nome ?? 'Convite (Pontos Corridos)';
    const privacyMap = { A: 'Aberta', F: 'Fechada' };
    const privacy = invite.competicao?.privacidade ? privacyMap[invite.competicao.privacidade] : '';
    const subtitle = privacy ? `Pontos Corridos · ${privacy}` : 'Pontos Corridos';

    return (
      <InviteCard
        title={title}
        subtitle={subtitle}
        imageUrl={invite.competicao?.url_asset_png}
        teamName={invite.remetente?.nome}
        onAccept={() => handleAcceptPointsInvite(invite.id)}
        onDecline={() => handleDeclinePointsInvite(invite.id)}
      />
    );
  }, [handleAcceptInvite, handleAcceptPointsInvite, handleDeclineInvitation, handleDeclinePointsInvite]);

  const isLoading = isLoadingLeagueInvites || isLoadingPointsInvites;
  if (isLoading) return <LoadingScreen title="Carregando Convites" />;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        className="flex-1"
        style={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        {/* Header */}
        <View className="px-4 pt-3 pb-2" style={{ gap: 10, backgroundColor: 'transparent' }}>
          <View
            className="flex-row items-center justify-between"
            style={{ backgroundColor: 'transparent' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Feather name="chevron-left" size={20} color={colorTheme === 'dark' ? '#e5e7eb' : '#111827'} />
            </TouchableOpacity>

            <View style={{ flex: 1, paddingHorizontal: 12, backgroundColor: 'transparent' }}>
              <Text className="text-xl font-extrabold">Convites</Text>
              <Text className="text-xs text-gray-500">
                {invitesCount} {invitesCount === 1 ? 'convite' : 'convites'}
              </Text>
            </View>
          </View>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyInviteList />}
          refreshControl={
            <RefreshControl
              onRefresh={onRefetch}
              refreshing={isRefetchingLeagueInvites || isRefetchingPointsInvites}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
            gap: 10,
          }}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingTop: 10, paddingBottom: 6, backgroundColor: 'transparent' }}>
              <Text className="text-xs font-bold text-gray-500">{section.title}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaViewContainer>
  );
};

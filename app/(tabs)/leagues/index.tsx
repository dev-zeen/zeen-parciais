import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import {
  LEAGUE_KIND,
  LeagueKind,
  PRIVACY_LABEL,
  pluralTeams,
} from '@/components/contexts/leagues/leagueKinds';
import { LeagueListCard, LeagueListItem } from '@/components/contexts/leagues/LeagueListCard';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { SearchField } from '@/components/ui/SearchField';
import { StateView } from '@/components/ui/StateView';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePointsCompetitionInvites from '@/hooks/usePointsCompetitionInvites';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import type {
  PointsCompetitionFinalizedItem,
  PointsCompetitionListItem,
} from '@/models/Competition';
import { LeagueUserDetails } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';
import {
  useGetFinalizedPointsCompetitions,
  useGetPointsCompetitions,
} from '@/queries/competitions.query';
import { useGetInvites } from '@/queries/invites.query';
import { useGetLeagues } from '@/queries/leagues.query';
import { normalizeQuery } from '@/utils/format';

type Filter = 'all' | LeagueKind;

type Section = { title: string; subtitle?: string; data: LeagueListItem[] };

/** A partir de quantas ligas a busca aparece */
const SEARCH_THRESHOLD = 6;

const keyExtractor = (item: LeagueListItem) => item.key;

const fromLeague = (league: LeagueUserDetails, myTeamId?: number): LeagueListItem => {
  const privacy = PRIVACY_LABEL[league.tipo];

  if (league.mata_mata) {
    const total = league.quantidade_times;
    const filled = league.total_times_liga;
    const status = league.vencedor
      ? { label: 'Encerrada', tone: 'neutral' as const }
      : !league.sorteada
        ? total && filled < total
          ? { label: `Faltam ${total - filled} times`, tone: 'warning' as const }
          : { label: 'Aguardando sorteio', tone: 'warning' as const }
        : undefined;
    return {
      key: `league-${league.liga_id}`,
      kind: 'cup',
      name: league.nome,
      imageUrl: league.url_trofeu_png ?? league.imagem,
      meta: [privacy, total ? `${filled}/${total} times` : pluralTeams(filled)]
        .filter(Boolean)
        .join(' · '),
      isOwner: !!myTeamId && league.time_dono_id === myTeamId,
      status,
      href: `/leagues/league/${league.slug}`,
    };
  }

  return {
    key: `league-${league.liga_id}`,
    kind: 'classic',
    name: league.nome,
    imageUrl: league.url_flamula_png ?? league.imagem,
    meta: [privacy, pluralTeams(league.total_times_liga), league.sem_capitao ? null : 'com capitão']
      .filter(Boolean)
      .join(' · '),
    position: league.camp_ranking_num,
    variation: league.camp_variacao_num,
    isOwner: !!myTeamId && league.time_dono_id === myTeamId,
    href: `/leagues/league/${league.slug}`,
  };
};

const fromPoints = (
  competition: PointsCompetitionListItem | PointsCompetitionFinalizedItem,
  myTeamId?: number
): LeagueListItem => ({
  key: `points-${competition.id}`,
  kind: 'points',
  name: competition.nome,
  imageUrl: competition.url_taca_png,
  meta: [
    PRIVACY_LABEL[competition.privacidade],
    `${competition.quantidade_participantes}/${competition.quantidade_times} times`,
    `rodadas ${competition.rodada_inicial}–${competition.rodada_final}`,
  ].join(' · '),
  position: competition.sorteada ? competition.ranking_time?.posicao : undefined,
  variation: competition.finalizada ? undefined : competition.ranking_time?.variacao,
  isOwner: !!myTeamId && competition.time_dono_id === myTeamId,
  status: competition.finalizada
    ? { label: 'Encerrada', tone: 'neutral' }
    : !competition.sorteada
      ? { label: 'Aguardando times', tone: 'warning' }
      : undefined,
  href: `/leagues/points/${competition.slug}`,
});

export default function LeaguesScreen() {
  const { colors, spacing, radius, minTouch } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { isAutheticated } = useContext(AuthContext);
  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const { data: myClub, refetch: onRefetchMyClub } = useGetMyClub(allowRequest);
  const { data: invites, refetch: onRefetchInvites } = useGetInvites(allowRequest);
  const { invites: pointsInvites, refetch: onRefetchPointsInvites } = usePointsCompetitionInvites();
  const {
    data: leagues,
    isError: isErrorLeagues,
    refetch: onRefetchLeagues,
    isRefetching,
  } = useGetLeagues(!!allowRequest);
  const { data: pointsCompetitions, refetch: onRefetchPoints } =
    useGetPointsCompetitions(!!allowRequest);
  const { data: finalizedCompetitions, refetch: onRefetchFinalized } =
    useGetFinalizedPointsCompetitions(!!allowRequest);

  const invitesCount = (invites?.convites?.length ?? 0) + pointsInvites.length;
  const myTeamId = myClub?.time?.time_id;
  const isPro = !!myClub?.time?.assinante;

  // Todas as ligas normalizadas num formato só; filtros e busca atuam sobre isso.
  const groups = useMemo(() => {
    const ligas = leagues?.ligas ?? [];
    return {
      classic: ligas
        .filter((l) => l.time_dono_id && !l.mata_mata)
        .map((l) => fromLeague(l, myTeamId)),
      cup: ligas.filter((l) => l.mata_mata).map((l) => fromLeague(l, myTeamId)),
      // Ligas do próprio Cartola (sem dono); só fazem sentido com o mercado aberto, como antes.
      official: isMarketClose
        ? []
        : ligas.filter((l) => !l.time_dono_id).map((l) => fromLeague(l, myTeamId)),
      points: (pointsCompetitions ?? []).map((c) => fromPoints(c, myTeamId)),
      finished: (finalizedCompetitions ?? []).map((c) => fromPoints(c, myTeamId)),
    };
  }, [finalizedCompetitions, isMarketClose, leagues?.ligas, myTeamId, pointsCompetitions]);

  const counts = {
    all:
      groups.classic.length +
      groups.cup.length +
      groups.official.length +
      groups.points.length +
      groups.finished.length,
    classic: groups.classic.length + groups.official.length,
    cup: groups.cup.length,
    points: groups.points.length + groups.finished.length,
  };

  const sections = useMemo(() => {
    const query = normalizeQuery(search.trim());
    const match = (item: LeagueListItem) => !query || normalizeQuery(item.name).includes(query);
    const limit = (max?: number) => (max ? `limite ${max}` : undefined);
    const show = (kind: LeagueKind) => filter === 'all' || filter === kind;

    const candidates: (Section | false)[] = [
      show('classic') && {
        title: 'Clássicas',
        subtitle: limit(isPro ? marketStatus?.max_ligas_pro : marketStatus?.max_ligas_free),
        data: groups.classic,
      },
      show('cup') && {
        title: 'Mata-mata',
        subtitle: limit(
          isPro ? marketStatus?.max_ligas_matamata_pro : marketStatus?.max_ligas_matamata_free
        ),
        data: groups.cup,
      },
      show('points') && { title: 'Pontos corridos', data: groups.points },
      show('classic') && { title: 'Ligas do Cartola', data: groups.official },
      show('points') && { title: 'Encerradas', data: groups.finished },
    ];

    return candidates
      .filter((section): section is Section => !!section)
      .map((section) => ({ ...section, data: section.data.filter(match) }))
      .filter((section) => section.data.length > 0);
  }, [filter, groups, isPro, marketStatus, search]);

  const onRefetch = useCallback(() => {
    Promise.allSettled([
      onRefetchMyClub(),
      onRefetchLeagues(),
      onRefetchInvites(),
      onRefetchPointsInvites(),
      onRefetchPoints(),
      onRefetchFinalized(),
    ]);
  }, [
    onRefetchFinalized,
    onRefetchInvites,
    onRefetchLeagues,
    onRefetchMyClub,
    onRefetchPoints,
    onRefetchPointsInvites,
  ]);

  const openLeague = useCallback((href: string) => router.push(href as never), []);

  if (!isAutheticated) {
    return <Login reason="Entre para ver suas ligas, convites e o mata-mata." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket hasHeader />;
  }

  if (isErrorLeagues && !leagues) {
    return (
      <SafeAreaViewContainer edges={['top']}>
        <StateView
          icon="wifi-off"
          title="Não deu para carregar suas ligas"
          message="Confira a conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={onRefetch}
        />
      </SafeAreaViewContainer>
    );
  }

  if (!leagues) {
    return <LoadingScreen title="Carregando suas ligas" />;
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: `Todas · ${counts.all}` },
    { value: 'classic', label: `${LEAGUE_KIND.classic.plural} · ${counts.classic}` },
    { value: 'cup', label: `${LEAGUE_KIND.cup.plural} · ${counts.cup}` },
    { value: 'points', label: `${LEAGUE_KIND.points.plural} · ${counts.points}` },
  ];

  const isSearching = search.trim().length > 0;

  const listHeader = (
    <View style={{ paddingTop: spacing.sm, gap: spacing.sm }}>
      {invitesCount > 0 ? (
        <Pressable
          onPress={() => router.push('/leagues/invites')}
          accessibilityRole="button"
          accessibilityLabel={`Você tem ${invitesCount} ${
            invitesCount === 1 ? 'convite' : 'convites'
          } para ligas. Abrir convites`}
          android_ripple={{ color: colors.border }}
          style={({ pressed }) => [
            styles.banner,
            {
              gap: spacing.sm,
              padding: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: colors.accentContainer,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <View
            style={[
              styles.bannerIcon,
              { backgroundColor: colors.accentFill, borderRadius: radius.full },
            ]}>
            <Feather name="mail" size={18} color={colors.onAccentFill} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="body" weight="bold" color="accent">
              {invitesCount === 1 ? '1 convite esperando' : `${invitesCount} convites esperando`}
            </AppText>
            <AppText variant="label" color="accent">
              Aceite para começar a disputar
            </AppText>
          </View>
          <Feather name="chevron-right" size={18} color={colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaViewContainer edges={['top']}>
      {/* Cabeçalho fixo: título e convites, busca e filtros, com o mesmo respiro entre eles */}
      <View style={{ gap: spacing.sm, paddingTop: spacing.xs, paddingBottom: spacing.xs }}>
        <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
          <View style={{ flex: 1 }}>
            <AppText variant="display" weight="bold" accessibilityRole="header">
              Ligas
            </AppText>
            <AppText variant="label" color="textMuted">
              {counts.all === 1 ? 'Você está em 1 liga' : `Você está em ${counts.all} ligas`}
            </AppText>
          </View>
          <Pressable
            onPress={() => router.push('/leagues/invites')}
            accessibilityRole="button"
            accessibilityLabel={invitesCount ? `Convites, ${invitesCount} pendentes` : 'Convites'}
            style={({ pressed }) => [
              styles.iconButton,
              {
                width: minTouch,
                height: minTouch,
                borderRadius: minTouch / 2,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Feather name="mail" size={20} color={colors.text} />
            {invitesCount > 0 ? (
              <View
                style={[
                  styles.count,
                  { backgroundColor: colors.negativeFill, borderColor: colors.bg },
                ]}>
                <AppText variant="caption" weight="bold" color="onNegativeFill">
                  {invitesCount > 9 ? '9+' : invitesCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>

        {counts.all >= SEARCH_THRESHOLD ? (
          <View style={{ paddingHorizontal: spacing.md }}>
            <SearchField value={search} onChangeText={setSearch} placeholder="Buscar liga" />
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={{ gap: spacing.xs, paddingHorizontal: spacing.md }}>
          {filters.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filter === option.value}
              onPress={() => setFilter(option.value)}
            />
          ))}
        </ScrollView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <LeagueListCard item={item} onPress={openLeague} />}
        renderSectionHeader={({ section }) => (
          <View
            style={[styles.sectionHeader, { paddingTop: spacing.md, paddingBottom: spacing.xs }]}>
            <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
              {section.title.toUpperCase()} · {section.data.length}
            </AppText>
            {section.subtitle ? (
              <AppText variant="caption" color="textMuted">
                {section.subtitle}
              </AppText>
            ) : null}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          isSearching ? (
            <StateView
              icon="search"
              title="Nenhuma liga encontrada"
              message={`Nada com "${search.trim()}".`}
              actionLabel="Limpar busca"
              onAction={() => setSearch('')}
            />
          ) : counts.all === 0 ? (
            <StateView
              icon="award"
              title="Você ainda não está em nenhuma liga"
              message="Quando você entrar em uma liga do Cartola ou aceitar um convite, ela aparece aqui com sua posição."
              actionLabel={invitesCount ? 'Ver convites' : undefined}
              onAction={invitesCount ? () => router.push('/leagues/invites') : undefined}
            />
          ) : (
            <StateView
              icon="filter"
              title="Nenhuma liga nesta modalidade"
              message={`Você não participa de ligas ${
                filter === 'cup'
                  ? 'mata-mata'
                  : filter === 'points'
                    ? 'de pontos corridos'
                    : 'clássicas'
              }.`}
              actionLabel="Ver todas"
              onAction={() => setFilter('all')}
            />
          )
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: tabBarSpacing.contentBottom,
        }}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
      />
    </SafeAreaViewContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexGrow: 0,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    flexDirection: 'row',
  },
  pulseItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
});

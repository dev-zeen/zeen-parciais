import { Feather } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  ListRenderItemInfo,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';

import {
  LeagueAdminSheet,
  LeagueAdminSheetRef,
} from '@/components/contexts/leagues/LeagueAdminSheet';
import { LeagueSummaryCard } from '@/components/contexts/leagues/LeagueSummaryCard';
import {
  STAT_COLUMN,
  StandingHeader,
  StandingRow,
} from '@/components/contexts/leagues/StandingRow';
import {
  LEAGUE_KIND,
  PRIVACY_LABEL,
  formatPoints,
} from '@/components/contexts/leagues/leagueKinds';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateView } from '@/components/ui/StateView';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import type { Confronto, PointsCompetitionTeam } from '@/models/Competition';
import { useGetMyClub } from '@/queries/club.query';
import { useGetPointsCompetitionBySlug } from '@/queries/competitions.query';
import {
  FormResult,
  StandingEntry,
  computeStandings,
  isMatchPlayed,
} from '@/utils/pointsStandings';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PointsTab = 'table' | 'matches';

const keyExtractor = (item: StandingEntry) => `${item.time_id}`;

function FormDots({ forma }: { forma: FormResult[] }) {
  const { colors } = useTokens();
  const color = { V: colors.positiveFill, E: colors.warningFill, D: colors.negativeFill };
  const label = { V: 'vitória', E: 'empate', D: 'derrota' };
  return (
    <View
      style={styles.inline}
      accessible
      accessibilityLabel={`Últimos jogos: ${forma.map((r) => label[r]).join(', ')}`}>
      {forma.map((result, index) => (
        <View key={index} style={[styles.dot, { backgroundColor: color[result] }]} />
      ))}
    </View>
  );
}

export default function PointsCompetitionScreen() {
  const { colors, spacing, radius } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { isAutheticated } = useContext(AuthContext);
  const { allowRequest } = useMarketStatus();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data, isLoading, isError, refetch, isRefetching } = useGetPointsCompetitionBySlug(
    slug ?? '',
    allowRequest
  );
  const { data: myClub } = useGetMyClub(!!isAutheticated);

  const [view, setView] = useState<PointsTab>('table');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const listRef = useRef<FlatList<StandingEntry>>(null);
  const adminRef = useRef<LeagueAdminSheetRef>(null);

  const standings = useMemo(
    () => computeStandings(data?.participantes ?? {}, data?.confrontos),
    [data?.participantes, data?.confrontos]
  );

  const rounds = useMemo(
    () =>
      Object.keys(data?.confrontos ?? {})
        .map(Number)
        .sort((a, b) => a - b),
    [data?.confrontos]
  );

  // Rodada aberta por padrão na aba Jogos: a primeira com jogo pendente, ou a última.
  const defaultRound = useMemo(
    () =>
      rounds.find((round) =>
        (data?.confrontos?.[String(round)] ?? []).some((match) => !isMatchPlayed(match))
      ) ?? rounds[rounds.length - 1],
    [data?.confrontos, rounds]
  );
  const round = selectedRound ?? defaultRound;

  const myTeamId = myClub?.time?.time_id ?? 0;
  const myIndex = standings.findIndex((entry) => entry.time_id === myTeamId);

  const toggle = useCallback((id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<StandingEntry>) => {
      const isMine = item.time_id === myTeamId;
      const expanded = expandedId === item.time_id;
      return (
        <StandingRow
          rank={index + 1}
          name={item.nome}
          owner={item.nome_cartola}
          shieldUrl={item.url_escudo_png}
          isPro={item.assinante}
          isMine={isMine}
          onPress={() => toggle(item.time_id)}
          accessibilityLabel={`${index + 1}º, ${item.nome}${isMine ? ', seu time' : ''}, ${
            item.pontos
          } pontos, ${item.vitorias} vitórias, ${item.empates} empates, ${item.derrotas} derrotas`}
          accessibilityHint={expanded ? 'Recolhe os detalhes' : 'Mostra os detalhes'}
          footer={
            expanded ? (
              <View
                style={{
                  gap: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  paddingBottom: spacing.sm,
                }}>
                <View style={[styles.details, { gap: spacing.xs }]}>
                  {[
                    { label: 'Jogos', value: String(item.jogos) },
                    { label: 'Aproveit.', value: `${item.aproveitamento}%` },
                    { label: 'Feitos', value: formatPoints(item.gp) },
                    { label: 'Sofridos', value: formatPoints(item.gc) },
                    {
                      label: 'Saldo',
                      value: `${item.saldo >= 0 ? '+' : ''}${formatPoints(item.saldo)}`,
                    },
                    { label: 'Média', value: formatPoints(item.media) },
                  ].map((stat) => (
                    <View
                      key={stat.label}
                      style={[
                        styles.detail,
                        { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
                      ]}>
                      <AppText variant="caption" color="textMuted">
                        {stat.label}
                      </AppText>
                      <AppText variant="label" weight="bold">
                        {stat.value}
                      </AppText>
                    </View>
                  ))}
                </View>
                {item.forma.length ? (
                  <View style={[styles.inline, { gap: spacing.xs }]}>
                    <AppText variant="caption" color="textMuted">
                      Últimos jogos
                    </AppText>
                    <FormDots forma={item.forma} />
                  </View>
                ) : null}
                {item.proximoConfronto ? <NextMatchLine next={item.proximoConfronto} /> : null}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/leagues/club/[id]',
                      params: { id: item.time_id, posicao: index + 1, liga: data?.nome ?? '' },
                    })
                  }
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.inline,
                    { alignSelf: 'flex-start', minHeight: 32, opacity: pressed ? 0.6 : 1 },
                  ]}>
                  <AppText variant="label" weight="bold" color="accent">
                    Ver escalação
                  </AppText>
                  <Feather name="chevron-right" size={14} color={colors.accent} />
                </Pressable>
              </View>
            ) : undefined
          }>
          {[item.pontos, item.vitorias, item.empates, item.derrotas].map((value, column) => (
            <AppText
              key={column}
              variant={column === 0 ? 'body' : 'label'}
              weight={column === 0 ? 'bold' : 'medium'}
              color={column === 0 ? 'text' : 'textMuted'}
              align="center"
              style={{ width: STAT_COLUMN }}>
              {value}
            </AppText>
          ))}
        </StandingRow>
      );
    },
    [colors, data?.nome, expandedId, myTeamId, radius.sm, spacing, toggle]
  );

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;
  if (isLoading) return <LoadingScreen title="Carregando liga" />;
  if (!data) {
    return (
      <SafeAreaViewContainer edges={['top']}>
        <ScreenHeader title="Pontos corridos" />
        <StateView
          icon="wifi-off"
          title={isError ? 'Não deu para carregar a liga' : 'Liga não encontrada'}
          message="Confira a conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={() => refetch()}
        />
      </SafeAreaViewContainer>
    );
  }

  const isOwner = myTeamId === data.time_dono_id;
  // Depois do sorteio (ou encerrada) a tabela está fechada: não há como convidar.
  const canInvite = isOwner && !data.finalizada && !data.sorteada;
  const invited = Object.values(data.convidados ?? {});
  const mine = myIndex >= 0 ? standings[myIndex] : undefined;
  const leader = standings[0];
  const hasStarted = data.sorteada && rounds.length > 0;

  const summary =
    mine && hasStarted ? (
      <LeagueSummaryCard
        title={data.finalizada ? 'Sua campanha final' : 'Sua campanha'}
        stats={[
          { label: 'Posição', value: `${myIndex + 1}º`, hint: `de ${standings.length}` },
          {
            label: 'Pontos',
            value: String(mine.pontos),
            hint: `${mine.vitorias}V ${mine.empates}E ${mine.derrotas}D`,
          },
          myIndex === 0
            ? { label: 'Líder', value: data.finalizada ? 'Campeão' : 'Você', tone: 'positive' }
            : {
                label: 'Para o líder',
                value: `-${leader.pontos - mine.pontos}`,
                tone: 'negative',
                hint: 'pontos',
              },
        ]}
        onLocate={
          standings.length > 8 && view === 'table'
            ? () => listRef.current?.scrollToIndex({ index: myIndex, viewPosition: 0.5 })
            : undefined
        }>
        <View style={[styles.inline, { justifyContent: 'space-between' }]}>
          {mine.forma.length ? <FormDots forma={mine.forma} /> : <View />}
          <AppText variant="caption" color="textMuted">
            Aproveitamento {mine.aproveitamento}%
          </AppText>
        </View>
        {mine.proximoConfronto && !data.finalizada ? (
          <NextMatchLine next={mine.proximoConfronto} />
        ) : null}
      </LeagueSummaryCard>
    ) : null;

  const statusCard =
    data.finalizada && leader ? (
      <Card padding={spacing.md} style={[styles.inline, { gap: spacing.sm }]}>
        <Feather name="award" size={22} color={colors.warning} />
        <Image source={{ uri: leader.url_escudo_png }} style={styles.leaderShield} />
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color="textMuted">
            Competição encerrada · campeão
          </AppText>
          <AppText variant="body" weight="bold" numberOfLines={1}>
            {leader.nome}
          </AppText>
        </View>
      </Card>
    ) : !hasStarted ? (
      <Card padding={spacing.md} style={{ gap: spacing.xs }}>
        <AppText variant="label" weight="bold" color="textMuted">
          AGUARDANDO O SORTEIO
        </AppText>
        <AppText variant="body">
          {data.quantidade_participantes} de {data.quantidade_times} times confirmados
          {invited.length ? ` · ${invited.length} convidados sem resposta` : ''}.
        </AppText>
        <AppText variant="label" color="textMuted">
          A tabela de jogos sai quando as vagas forem preenchidas. Começa na rodada{' '}
          {data.rodada_inicial}.
        </AppText>
      </Card>
    ) : null;

  const roundMatches = round != null ? (data.confrontos?.[String(round)] ?? []) : [];
  const sortedRoundMatches = [...roundMatches].sort(
    (a, b) =>
      Number(b.mandante.id === myTeamId || b.visitante.id === myTeamId) -
      Number(a.mandante.id === myTeamId || a.visitante.id === myTeamId)
  );

  const listHeader = (
    <View style={{ gap: spacing.sm, paddingBottom: spacing.xxs }}>
      {statusCard}
      {summary}
      {hasStarted ? (
        <SegmentedControl
          options={[
            { value: 'table', label: 'Classificação' },
            { value: 'matches', label: `Jogos · ${rounds.length} rodadas` },
          ]}
          value={view}
          onChange={setView}
        />
      ) : null}
      {view === 'table' ? (
        <StandingHeader
          columns={[{ label: 'PTS' }, { label: 'V' }, { label: 'E' }, { label: 'D' }]}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs }}>
          {rounds.map((r) => (
            <Chip
              key={r}
              label={`Rodada ${r}`}
              selected={r === round}
              onPress={() => setSelectedRound(r)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader
        title={data.nome}
        subtitle={[
          LEAGUE_KIND.points.label,
          PRIVACY_LABEL[data.privacidade],
          `${data.quantidade_participantes}/${data.quantidade_times} times`,
          `rodadas ${data.rodada_inicial}–${data.rodada_final}${data.tem_returno ? ' com returno' : ''}`,
        ].join(' · ')}
        imageUrl={data.url_taca_png}
        actions={
          canInvite
            ? [
                {
                  icon: 'settings',
                  accessibilityLabel: 'Gerenciar liga',
                  onPress: () => adminRef.current?.open(),
                },
              ]
            : undefined
        }
      />

      {view === 'table' ? (
        <FlatList
          ref={listRef}
          data={standings}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          extraData={expandedId}
          ListHeaderComponent={listHeader}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingTop: spacing.xs,
            paddingBottom: tabBarSpacing.contentBottom,
          }}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            listRef.current?.scrollToOffset({ offset: index * averageItemLength, animated: true });
            setTimeout(() => listRef.current?.scrollToIndex({ index, viewPosition: 0.5 }), 250);
          }}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                refetch();
              }}
              refreshing={isRefetching}
            />
          }
        />
      ) : (
        <FlatList
          data={sortedRoundMatches}
          keyExtractor={(match) => `${round}-${match.mandante.id}-${match.visitante.id}`}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              home={data.participantes[String(item.mandante.id)]}
              away={data.participantes[String(item.visitante.id)]}
              myTeamId={myTeamId}
            />
          )}
          ListHeaderComponent={listHeader}
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingTop: spacing.xs,
            paddingBottom: tabBarSpacing.contentBottom,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {canInvite ? (
        <LeagueAdminSheet
          ref={adminRef}
          leagueName={data.nome}
          inviteHref={{
            pathname: '/leagues/create/invite',
            params: { type: 'points', slug: data.slug },
          }}
          pendingTeams={invited.map((team) => ({
            id: team.time_id,
            name: team.nome,
            owner: team.nome_cartola,
            shieldUrl: team.url_escudo_png,
          }))}
        />
      ) : null}
    </SafeAreaViewContainer>
  );
}

function NextMatchLine({ next }: { next: NonNullable<StandingEntry['proximoConfronto']> }) {
  const { colors, spacing, radius } = useTokens();
  return (
    <View
      style={[
        styles.inline,
        {
          gap: spacing.xs,
          padding: spacing.xs,
          borderRadius: radius.sm,
          backgroundColor: colors.surfaceAlt,
        },
      ]}>
      <AppText variant="caption" weight="bold" color="textMuted">
        PRÓXIMO · RD {next.rodada}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {next.isMandante ? 'em casa vs' : 'fora vs'}
      </AppText>
      <Image source={{ uri: next.adversario.url_escudo_png }} style={styles.smallShield} />
      <AppText variant="label" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
        {next.adversario.nome}
      </AppText>
    </View>
  );
}

/** Jogo de uma rodada: pontuação do Cartola de cada lado e pontos conquistados. */
function MatchCard({
  match,
  home,
  away,
  myTeamId,
}: {
  match: Confronto;
  home?: PointsCompetitionTeam;
  away?: PointsCompetitionTeam;
  myTeamId: number;
}) {
  const { colors, spacing, radius } = useTokens();
  const played = isMatchPlayed(match);
  const isMine = match.mandante.id === myTeamId || match.visitante.id === myTeamId;

  const sides = [
    { team: home, part: match.mandante },
    { team: away, part: match.visitante },
  ];

  return (
    <View
      style={{
        gap: spacing.xs,
        padding: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: isMine ? colors.accentContainer : colors.surface,
        borderWidth: 1,
        borderColor: isMine ? colors.accentFill : 'transparent',
      }}>
      {sides.map(({ team, part }) => {
        const won = played && match.vencedor_id === part.id;
        const lost = played && match.vencedor_id !== null && match.vencedor_id !== part.id;
        return (
          <View
            key={part.id}
            style={[styles.inline, { gap: spacing.xs, minHeight: 32, opacity: lost ? 0.5 : 1 }]}
            accessible
            accessibilityLabel={`${team?.nome ?? 'Time'}${part.id === myTeamId ? ', seu time' : ''}${
              played ? `, ${formatPoints(part.pontuacao_rodada)} pontos` : ''
            }${won ? ', venceu' : ''}`}>
            <Image source={{ uri: team?.url_escudo_png }} style={styles.smallShield} />
            <AppText
              variant="body"
              weight={won || part.id === myTeamId ? 'bold' : 'medium'}
              numberOfLines={1}
              style={{ flex: 1 }}>
              {team?.nome ?? '...'}
            </AppText>
            {played ? (
              <AppText variant="body" weight="bold" color={won ? 'positive' : 'text'}>
                {formatPoints(part.pontuacao_rodada)}
              </AppText>
            ) : null}
          </View>
        );
      })}
      <AppText variant="caption" color="textMuted">
        {played
          ? match.vencedor_id === null
            ? 'Empate · 1 ponto para cada'
            : 'Encerrado · vitória vale 3 pontos'
          : 'A disputar'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detail: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  leaderShield: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  smallShield: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});

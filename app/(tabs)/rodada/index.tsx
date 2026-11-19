import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { FixtureTicker } from '@/components/contexts/matches/FixtureTicker';
import { MatchCard } from '@/components/contexts/matches/MatchCard';
import { PlayerCard } from '@/components/contexts/players/PlayerCard/PlayerCard';
import { onGetPlayersPlayed } from '@/components/contexts/players/_players.helper';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { ErrorScreen } from '@/components/structure/ErrorScreen';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { AppText } from '@/components/ui/AppText';
import { SearchField } from '@/components/ui/SearchField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateView } from '@/components/ui/StateView';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import useValorization from '@/hooks/useValorization';
import { Match } from '@/models/Matches';
import { Appreciations } from '@/models/Player';
import { Player, PlayerStats } from '@/models/Stats';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetMatchs } from '@/queries/matches.query';
import { normalizeQuery } from '@/utils/format';

type ActiveTab = 'jogadores' | 'partidas' | 'calendario';

export interface ScorePlayersProps extends Player {
  valorization?: number;
}

const keyExtractorPlayer = (item: Player) => item.id;
const keyExtractorMatch = (item: Match) => String(item.partida_id);

/** Rodada: pública. Jogadores pontuados e partidas; detalhes da partida pedem login. */
export default function RodadaScreen() {
  const { colors, spacing, radius, minTouch } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { isAutheticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<ActiveTab>('jogadores');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    isMarketClose,
    allowRequest,
    isLoadingMarketStatus,
    isErrorMarketStatus,
    onRefetchMarketStatus,
  } = useMarketStatus();
  const { data: market } = useGetMarket();
  const { playerStats, onRefetchStats, isRefetchingPlayerStats, isLoadingPlayerStats } =
    usePlayerStats();
  const { onRefetchValorizations, valorizations } = useValorization();
  const {
    data: matches,
    isLoading: isLoadingMatches,
    refetch: onRefetchMatches,
    isRefetching: isRefetchingMatches,
  } = useGetMatchs();
  const { data: myClub } = useGetMyClub(allowRequest);

  // Mercado fechado: parciais ao vivo; aberto: pontuados da última rodada, vindos do mercado.
  // Sem estatísticas ainda não há clube/posição para mostrar, então a lista fica vazia (como antes).
  const players = useMemo((): ScorePlayersProps[] | undefined => {
    if (!playerStats) return undefined;
    if (isMarketClose) {
      return onGetPlayersPlayed(playerStats as PlayerStats, valorizations as Appreciations);
    }
    return market?.atletas
      .filter((item) => item.entrou_em_campo)
      .map((item) => ({
        id: String(item.atleta_id),
        apelido: item.apelido_abreviado,
        foto: item?.foto,
        pontuacao: item.pontos_num,
        posicao_id: item.posicao_id,
        clube_id: item.clube_id,
        entrou_em_campo: item.entrou_em_campo,
        scout: playerStats.atletas?.[item.atleta_id]?.scout,
        valorization: valorizations?.atletas?.[item.atleta_id]?.variacao_num,
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);
  }, [isMarketClose, market, playerStats, valorizations]);

  const filteredPlayers = useMemo(() => {
    const query = normalizeQuery(searchQuery);
    if (!query) return players;
    return players?.filter((item) => normalizeQuery(item.apelido).includes(query));
  }, [players, searchQuery]);

  const onRefetchPlayers = useCallback(async () => {
    await Promise.all([onRefetchValorizations(), onRefetchStats()]);
  }, [onRefetchValorizations, onRefetchStats]);

  const renderPlayer = useCallback(
    ({ item: player }: ListRenderItemInfo<ScorePlayersProps>) => (
      <PlayerCard
        player={player}
        club={playerStats?.clubes[String(player.clube_id)]}
        position={playerStats?.posicoes[player.posicao_id]}
        valorization={player.valorization}
      />
    ),
    [playerStats]
  );

  const renderMatch = useCallback(
    ({ item }: ListRenderItemInfo<Match>) => (
      <MatchCard
        match={item}
        players={myClub?.atletas}
        homeClub={matches?.clubes[item.clube_casa_id]}
        awayClub={matches?.clubes[item.clube_visitante_id]}
        isDisabled={!allowRequest || !item.valida}
      />
    ),
    [myClub?.atletas, matches?.clubes, allowRequest]
  );

  if (isErrorMarketStatus) {
    return (
      <ErrorScreen
        message="Não foi possível carregar os dados do mercado."
        onRetry={onRefetchMarketStatus}
      />
    );
  }

  if (isLoadingMarketStatus || isLoadingPlayerStats || isLoadingMatches) {
    return <LoadingScreen title="Carregando Rodada" />;
  }

  const isPlayers = activeTab === 'jogadores';
  const listStyle = { padding: spacing.md, paddingBottom: tabBarSpacing.contentBottom };
  const separator = () => <View style={{ height: spacing.xs }} />;

  return (
    <SafeAreaViewContainer edges={['top']}>
      {/* Topo fixo: status da rodada, alternância e busca */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs, gap: spacing.sm }}>
        <MarketStatusCard />
        <SegmentedControl
          options={[
            {
              value: 'jogadores',
              label: players ? `Jogadores · ${players.length}` : 'Jogadores',
            },
            {
              value: 'partidas',
              label: matches?.partidas ? `Partidas · ${matches.partidas.length}` : 'Partidas',
            },
            { value: 'calendario', label: 'Calendário' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        {isPlayers && players?.length ? (
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar jogador"
            accessibilityLabel="Buscar jogador pontuado pelo nome"
          />
        ) : null}
      </View>

      {activeTab === 'calendario' ? (
        <FixtureTicker contentContainerStyle={listStyle} />
      ) : isPlayers ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={keyExtractorPlayer}
          renderItem={renderPlayer}
          ItemSeparatorComponent={separator}
          contentContainerStyle={listStyle}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          initialNumToRender={12}
          maxToRenderPerBatch={20}
          refreshControl={
            <RefreshControl onRefresh={onRefetchPlayers} refreshing={isRefetchingPlayerStats} />
          }
          ListHeaderComponent={
            filteredPlayers?.length ? (
              <AppText
                variant="label"
                weight="bold"
                color="textMuted"
                style={{ marginBottom: spacing.xs }}>
                {isMarketClose ? 'PARCIAIS AO VIVO' : 'PONTUAÇÃO DA ÚLTIMA RODADA'}
              </AppText>
            ) : undefined
          }
          ListEmptyComponent={
            players?.length ? (
              <StateView
                icon="search"
                title="Nenhum jogador encontrado"
                message={`Nada com "${searchQuery.trim()}". Confira a grafia.`}
                actionLabel="Limpar busca"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <StateView
                icon="clock"
                title="Ainda sem pontuações"
                message="Os jogadores aparecem aqui assim que pontuarem durante os jogos."
              />
            )
          }
        />
      ) : (
        <FlatList
          data={matches?.partidas}
          keyExtractor={keyExtractorMatch}
          renderItem={renderMatch}
          ItemSeparatorComponent={separator}
          contentContainerStyle={listStyle}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                onRefetchMatches();
              }}
              refreshing={isRefetchingMatches}
            />
          }
          ListHeaderComponent={
            !isAutheticated && matches?.partidas?.length ? (
              <Pressable
                onPress={() => router.navigate('/(tabs)/team')}
                accessibilityRole="button"
                accessibilityHint="Abre a tela de login"
                style={({ pressed }) => [
                  styles.hint,
                  {
                    minHeight: minTouch,
                    gap: spacing.xs,
                    padding: spacing.sm,
                    marginBottom: spacing.xs,
                    borderRadius: radius.md,
                    backgroundColor: colors.accentContainer,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <Feather name="lock" size={16} color={colors.accent} />
                <AppText variant="label" weight="medium" color="accent" style={{ flex: 1 }}>
                  Entre para ver os jogadores de cada partida e quantos são do seu time.
                </AppText>
                <Feather name="chevron-right" size={16} color={colors.accent} />
              </Pressable>
            ) : undefined
          }
          ListEmptyComponent={
            <StateView
              icon="calendar"
              title="Sem partidas"
              message="As partidas da rodada ainda não foram divulgadas."
              actionLabel="Atualizar"
              onAction={() => onRefetchMatches()}
            />
          }
        />
      )}
    </SafeAreaViewContainer>
  );
}

const styles = StyleSheet.create({
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

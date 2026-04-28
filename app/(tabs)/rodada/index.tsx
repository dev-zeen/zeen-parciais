import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { MatchCard } from '@/components/contexts/matches/MatchCard';
import { PlayerCard } from '@/components/contexts/players/PlayerCard/PlayerCard';
import { onGetPlayersPlayed } from '@/components/contexts/players/_players.helper';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { ErrorScreen } from '@/components/structure/ErrorScreen';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import { useThemeColor } from '@/hooks/useThemeColor';
import useValorization from '@/hooks/useValorization';
import { Match } from '@/models/Matches';
import { Appreciations } from '@/models/Player';
import { Player, PlayerStats } from '@/models/Stats';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetMatchs } from '@/queries/matches.query';
import { GRAY_OPACITY } from '@/styles/colors';
import { normalizeQuery } from '@/utils/format';

type ActiveTab = 'jogadores' | 'partidas';

export interface ScorePlayersProps extends Player {
  valorization?: number;
}

export default function RodadaScreen() {
  const colorTheme = useThemeColor();
  const [activeTab, setActiveTab] = useState<ActiveTab>('jogadores');
  const [searchQuery, setSearchQuery] = useState('');

  const { isMarketClose, allowRequest, isLoadingMarketStatus, isErrorMarketStatus, onRefetchMarketStatus } = useMarketStatus();
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

  // --- Players logic ---
  const getFilteredData = useCallback((players?: Player[], query?: string) => {
    return players?.filter((item) => {
      const itemData = normalizeQuery(item.apelido);
      const textData = normalizeQuery(query ?? '');
      return itemData.includes(textData);
    });
  }, []);

  const mainDataMarket: ScorePlayersProps[] | undefined = useMemo(() => {
    if (market && !isMarketClose) {
      return market.atletas
        .filter((item) => item.entrou_em_campo)
        .map((item) => ({
          id: String(item.atleta_id),
          apelido: item.apelido_abreviado,
          foto: item?.foto,
          pontuacao: item.pontos_num,
          posicao_id: item.posicao_id,
          clube_id: item.clube_id,
          entrou_em_campo: item.entrou_em_campo,
          scout: playerStats?.atletas?.[item.atleta_id]?.scout,
          valorization: valorizations?.atletas?.[item.atleta_id]?.variacao_num,
        }))
        .sort((a, b) => (b?.pontuacao as number) - (a?.pontuacao as number));
    }
  }, [isMarketClose, market, playerStats, valorizations]);

  const filteredPlayers = useMemo(() => {
    const playersToFilter = isMarketClose
      ? onGetPlayersPlayed(playerStats as PlayerStats, valorizations as Appreciations)
      : mainDataMarket;
    return getFilteredData(playersToFilter, searchQuery);
  }, [isMarketClose, playerStats, valorizations, mainDataMarket, searchQuery, getFilteredData]);

  const onRefetchPlayers = useCallback(async () => {
    await Promise.all([onRefetchValorizations(), onRefetchStats()]);
  }, [onRefetchValorizations, onRefetchStats]);

  // --- Render helpers ---
  const keyExtractorPlayer = useCallback((item: Player) => `${item?.foto} + ${item.id}`, []);
  const keyExtractorMatch = useCallback((item: Match) => `${item.clube_casa_id}`, []);

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

  const isLoading = isLoadingMarketStatus || isLoadingPlayerStats || isLoadingMatches;

  if (isErrorMarketStatus) {
    return (
      <ErrorScreen
        message="Não foi possível carregar os dados do mercado."
        onRetry={onRefetchMarketStatus}
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen title="Carregando Rodada" />;
  }

  const bgColor = colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull;
  const isPlayers = activeTab === 'jogadores';

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View className="flex-1 mx-2" style={{ backgroundColor: bgColor }}>
        <MarketStatusCard />

        {/* Toggle */}
        <View
          className="flex-row mx-1 mt-2 mb-1 rounded-xl overflow-hidden"
          style={{
            backgroundColor: colorTheme === 'dark' ? '#161B22' : '#F0F0F0',
          }}>
          {(['jogadores', 'partidas'] as ActiveTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
                className="flex-1 py-2 items-center"
                style={{
                  backgroundColor: isActive ? Colors.light.tint : 'transparent',
                  borderRadius: 10,
                  margin: 2,
                }}>
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{
                    color: isActive ? '#fff' : colorTheme === 'dark' ? '#9CA3AF' : '#6B7280',
                  }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Jogadores */}
        {isPlayers && (
          <>
            {!playerStats ? (
              <View
                className="flex-row py-4 px-8 rounded-lg items-center justify-center m-2"
                style={{ gap: 8 }}>
                <Feather name="info" size={24} color={Colors.light.tint} />
                <Text className="text-sm font-semibold text-center">
                  Os jogadores serão exibidos assim que obtiverem suas pontuações durante os jogos.
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  placeholder="Buscar Jogador"
                  placeholderTextColor={GRAY_OPACITY}
                  autoCorrect={false}
                  style={{
                    marginTop: 4,
                    marginBottom: 4,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colorTheme === 'dark' ? '#1f2937' : '#d1d5db',
                    backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                    color: colorTheme === 'dark' ? '#f9fafb' : '#111827',
                    fontFamily: 'Satoshi-Variable',
                  }}
                />
                <FlatList
                  refreshControl={
                    <RefreshControl
                      onRefresh={onRefetchPlayers}
                      refreshing={isRefetchingPlayerStats}
                    />
                  }
                  data={filteredPlayers}
                  keyExtractor={keyExtractorPlayer}
                  ItemSeparatorComponent={() => (
                    <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
                  )}
                  renderItem={renderPlayer}
                  contentContainerStyle={{ paddingVertical: 4, backgroundColor: bgColor }}
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                />
              </>
            )}
          </>
        )}

        {/* Partidas */}
        {!isPlayers && (
          <FlatList
            contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
            refreshControl={
              <RefreshControl onRefresh={onRefetchMatches} refreshing={isRefetchingMatches} />
            }
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            data={matches?.partidas}
            keyExtractor={keyExtractorMatch}
            renderItem={renderMatch}
          />
        )}
      </View>
    </SafeAreaViewContainer>
  );
}

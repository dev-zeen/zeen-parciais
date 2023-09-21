import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ListRenderItemInfo, SectionList, useColorScheme } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';

import { Text, TouchableOpacity, View } from '@/components/Themed';
import { ClubPlayerCard } from '@/components/contexts/leagues/club/ClubPlayerCard';
import { TeamBanner } from '@/components/contexts/utils/TeamBanner';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePartialScore from '@/hooks/usePartialScore';
import useTeam from '@/hooks/useTeam';
import useValorization from '@/hooks/useValorization';
import { FullClubInfo } from '@/models/Club';
import { MarketStatus } from '@/models/Market';
import { FullPlayer } from '@/models/Stats';
import { useGetMatchSubstitutions } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { BACKGROUND_DEFAULT_DARK, BACKGROUND_DEFAULT_LIGHT } from '@/styles/colors';
import { numberToString } from '@/utils/parseTo';
import { onUpdateTeamWithSubstitutedPlayers } from '@/utils/partials';

const TYPE_VIEW = {
  CAMPO: 'CAMPO',
  LISTA: 'LISTA',
};

export interface PlayerClub extends FullPlayer {
  isReplaced?: boolean;
  isJoined?: boolean;
  isReserve?: boolean;
}

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const isFirstRender = useRef(true);

  const { id } = useLocalSearchParams();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const typeViewDefault = TYPE_VIEW.LISTA;

  const {
    data: playerStats,
    isRefetching: isRefetchingPlayerStats,
    refetch: onRefetchStats,
  } = useGetScoredPlayers(isMarketClose);

  const { valorizations, onRefetchValorizations, isRefetchingValorizations } = useValorization();

  const marketRound = useMemo(() => marketStatus?.rodada_atual, [marketStatus?.rodada_atual]);

  const [currentRound, setCurrentRound] = useState(0);

  const { team } = useTeam({
    teamId: Number(id),
    round: currentRound,
  });

  const { data: substitutions } = useGetMatchSubstitutions({
    id: Number(id),
    round: currentRound,
  });

  const rounds = useMemo(
    () => Array.from({ length: marketRound ?? 0 }, (_, index) => index + 1),
    [marketRound]
  );

  const { partialScore, totalPartialScore, partialValorization, totalPartialValorization } =
    usePartialScore({
      teamId: team?.time?.time_id ?? 0,
    });

  const onGetPlayersTab = (team: FullClubInfo) => {
    const { playersUpdated, reservesUpdated } = onUpdateTeamWithSubstitutedPlayers(
      team,
      substitutions
    );

    return [
      {
        title: 'Titulares',
        data: playersUpdated,
      },
      {
        title: 'Reservas',
        data: reservesUpdated.map((item) => {
          return {
            ...item,
            isReserve: true,
          };
        }),
      },
    ];
  };

  useEffect(() => {
    if (marketStatus && isFirstRender.current) {
      const round = isMarketClose ? marketStatus.rodada_atual : marketStatus.rodada_atual - 1;
      setCurrentRound(round);

      isFirstRender.current = false;
    }
  }, [isMarketClose, marketStatus]);

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchStats(), onRefetchValorizations()]);
  }, [onRefetchStats, onRefetchValorizations]);

  const isRefetching = isRefetchingPlayerStats && isRefetchingValorizations;

  const flatListRef = useRef<FlatList<number> | null>(null);

  const scrollToSelectedRound = useCallback(() => {
    if (marketRound && marketRound >= 1) {
      flatListRef.current?.scrollToIndex({
        index: marketRound - 1,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [marketRound]);

  useEffect(() => {
    scrollToSelectedRound();
  }, [scrollToSelectedRound]);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<PlayerClub>) => {
      return (
        <ClubPlayerCard
          player={player}
          isCapitain={team?.capitao_id === player.atleta_id}
          currentRound={currentRound}
          marketStatus={marketStatus as MarketStatus}
          playerStats={playerStats}
          isReserve={player.isReserve}
          appreciation={valorizations?.atletas[player.atleta_id]?.variacao_num}
          isReplacePlayer={substitutions?.some(
            (item) =>
              item.entrou.atleta_id === player.atleta_id || item.saiu.atleta_id === player.atleta_id
          )}
        />
      );
    },
    [
      currentRound,
      marketStatus,
      playerStats,
      substitutions,
      team?.capitao_id,
      valorizations?.atletas,
    ]
  );

  const renderItemRound = useCallback(
    ({ item }: ListRenderItemInfo<number>) => {
      return (
        <TouchableOpacity
          className="w-12 py-4 items-center justify-center border-2 border-blue-400 rounded-md"
          style={{
            borderWidth: 2,
            borderColor: currentRound === item ? '#60A5FA' : Colors.light.backgroundFull,
          }}
          onPress={() => setCurrentRound(item)}>
          <Text>{item}</Text>
        </TouchableOpacity>
      );
    },
    [currentRound]
  );

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  const keyExtractor = useCallback((item: PlayerClub) => `${item.atleta_id}`, []);

  const isLoading = isMarketClose ? !playerStats || !marketStatus : !marketStatus;

  if (isLoading || !team || !marketRound || !rounds || !currentRound) {
    return <Loading />;
  }

  return (
    <>
      <View
        className="px-2 pt-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? BACKGROUND_DEFAULT_DARK : BACKGROUND_DEFAULT_LIGHT,
        }}>
        <TeamBanner team={team as FullClubInfo} />
        <View className="flex-row justify-between items-center rounded-lg p-3">
          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Patrim.</Text>
            <View className="flex-row">
              <Text className="font-semibold text-sm">
                {isMarketClose && currentRound === marketRound
                  ? numberToString(totalPartialValorization)
                  : numberToString(team?.patrimonio)}
              </Text>
              {isMarketClose && currentRound === marketRound && (
                <View className="flex-row pl-2 justify-center items-center">
                  <Text className="font-semibold text-sm">
                    {numberToString(partialValorization)}
                  </Text>

                  <Feather
                    size={16}
                    name={
                      partialValorization && partialValorization < 0 ? 'arrow-down' : 'arrow-up'
                    }
                    color={partialValorization && partialValorization < 0 ? '#ef4444' : '#4ade80'}
                  />
                </View>
              )}
            </View>
          </View>

          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Pontuação</Text>

            <Text
              className={`font-semibold text-sm ${
                currentRound === marketRound && 'text-green-500'
              }`}>
              {currentRound === marketRound
                ? numberToString(partialScore)
                : numberToString(team?.pontos)}
            </Text>
          </View>

          <View className="justify-center items-center gap-1">
            <Text className="font-light text-xs">Total</Text>
            <Text
              className={`font-semibold text-sm ${
                currentRound === marketRound && 'text-green-500'
              }`}>
              {' '}
              {currentRound === marketRound
                ? numberToString(totalPartialScore)
                : numberToString(team?.pontos_campeonato)}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="flex-row items-center justify-center px-2 pt-2"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <FlatList
          getItemLayout={(data, index) => ({
            length: 52,
            offset: 52 * index,
            index,
          })}
          ref={flatListRef}
          data={rounds}
          renderItem={renderItemRound}
          keyExtractor={(item) => `${item}`}
          horizontal
          contentContainerStyle={{
            gap: 4,
          }}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={38}
          initialScrollIndex={currentRound - 1}
        />
      </View>

      {typeViewDefault === TYPE_VIEW.CAMPO && <View></View>}

      {typeViewDefault === TYPE_VIEW.LISTA && (
        <SectionList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          initialNumToRender={17}
          sections={onGetPlayersTab(team as FullClubInfo)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          stickyHeaderHiddenOnScroll
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 8,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View
              className="pt-2 rounded"
              style={{
                backgroundColor:
                  colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
              }}>
              <Text className="font-bold text-base text-center items-center">{title}</Text>
            </View>
          )}
        />
      )}
    </>
  );
};

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  View,
  useColorScheme,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import { fillLineupWithPlayers } from "@/app/(tabs)/team/team.helpers";
import { MarketPlayerCard } from "@/components/contexts/market/MarketPlayerCard";
import { MatchCard } from "@/components/contexts/matches/MatchCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ITabs, Tabs } from "@/components/structure/Tabs";
import Colors from "@/constants/Colors";
import { LINEUPS_DEFAULT_OBJECT } from "@/constants/Formations";
import { ENUM_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { Match } from "@/models/Matches";
import { FullPlayer } from "@/models/Stats";
import { useGetMyClub } from "@/queries/club.query";
import { useGetMarket, useGetMarketStatus } from "@/queries/market.query";
import useTeamLineupStore from "@/store/useTeamLineupStore";

export default () => {
  const colorTheme = useColorScheme();

  const { id } = useLocalSearchParams();

  const allowRequest = true;

  const { data: marketStatus } = useGetMarketStatus();
  const { data: market } = useGetMarket();
  const { data: club } = useGetMyClub(allowRequest);

  const lineup = useTeamLineupStore((state) => state.lineup);
  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const price = useTeamLineupStore((state) => state.price);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const addPlayerToLineup = useTeamLineupStore(
    (state) => state.addPlayerToLineup
  );
  const removePlayerFromLineup = useTeamLineupStore(
    (state) => state.removePlayerFromLineup
  );

  const [match, setMatch] = useState<Match>();
  const [emptyPositions, setEmptyPositions] = useState<Set<number>>();

  const [homeTeamPlayers, setHomeTeamPlayers] = useState<
    FullPlayer[] | undefined
  >();

  const [awayTeamPlayers, setAwayTeamPlayers] = useState<
    FullPlayer[] | undefined
  >();

  const handleAddPlayerToLineup = useCallback(
    (player: FullPlayer) => {
      addPlayerToLineup({
        player,
      });
    },
    [lineup]
  );

  const handleRemovePlayerFromLineup = useCallback(
    (player: FullPlayer) => {
      removePlayerFromLineup(player);
    },
    [lineup]
  );

  const remainingValue = useMemo(() => {
    if (club && price) {
      return club.patrimonio - price;
    }
    return club?.patrimonio as number;
  }, [club, price]);

  const tabs: ITabs[] = useMemo(
    () => [
      {
        id: 1,
        title: market?.clubes[match?.clube_casa_id as number]?.nome as string,
        content: () => {
          return (
            <FlatList
              style={{ marginBottom: 350 }}
              contentContainerStyle={{
                gap: 8,
                paddingVertical: 8,
              }}
              data={homeTeamPlayers}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              maxToRenderPerBatch={6}
              initialNumToRender={6}
            />
          );
        },
      },
      {
        id: 2,
        title: market?.clubes[match?.clube_visitante_id as number]
          ?.nome as string,
        content: () => {
          return (
            <FlatList
              style={{ marginBottom: 350 }}
              contentContainerStyle={{
                gap: 8,
                paddingVertical: 8,
              }}
              data={awayTeamPlayers}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              maxToRenderPerBatch={6}
              initialNumToRender={6}
            />
          );
        },
      },
    ],
    [awayTeamPlayers, homeTeamPlayers]
  );

  useEffect(() => {
    if (id) {
      const match = JSON.parse(id as string);
      setMatch(match);
    }
  }, [id]);

  useEffect(() => {
    if (!lineup && club) {
      const defaultLineup = fillLineupWithPlayers(
        club,
        (LINEUPS_DEFAULT_OBJECT as any)[club?.time.esquema_id as number]
      );

      updateLineup(defaultLineup);
      updateCapitain(club.capitao_id);
    }
  }, [club, lineup]);

  useEffect(() => {
    if (market && match) {
      const filterPlayers = (teamId: number) =>
        market?.atletas
          .filter(
            (item) =>
              item.clube_id === Number(market.clubes[teamId].id) &&
              item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL
          )
          .sort((a, b) => a.posicao_id - b.posicao_id);

      const homeTeamPlayersUpdated = filterPlayers(match.clube_casa_id);
      const awayTeamPlayersUpdated = filterPlayers(match.clube_visitante_id);

      setHomeTeamPlayers(homeTeamPlayersUpdated);
      setAwayTeamPlayers(awayTeamPlayersUpdated);
    }
  }, [match, market, lineup]);

  useEffect(() => {
    if (lineup) {
      const emptyPositionsUpdated = new Set(
        (lineup?.starting || [])
          .filter(({ player }) => !player)
          .map(({ position }) => position)
      );
      setEmptyPositions(emptyPositionsUpdated);
    }
  }, [lineup]);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      return (
        <MarketPlayerCard
          player={player}
          onPressAddPlayerToLineup={() => handleAddPlayerToLineup(player)}
          onPressRemovePlayerFromLineup={() =>
            handleRemovePlayerFromLineup(player)
          }
          isButtonDisabled={
            player.preco_num > remainingValue ||
            !emptyPositions?.has(player.posicao_id)
          }
          isSellPlayer={lineup?.starting.some(
            (item) => item.player?.atleta_id === player.atleta_id
          )}
        />
      );
    },
    [lineup, homeTeamPlayers, awayTeamPlayers]
  );

  const keyExtractor = useCallback(
    (item: FullPlayer) => `${item.atleta_id}`,
    []
  );

  if (!market || !match || !homeTeamPlayers || !awayTeamPlayers) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className="mx-2 rounded-lg"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === "dark"
              ? Colors.dark.backgroundFull
              : Colors.light.backgroundFull,
        }}
      >
        <MatchCard
          match={match as Match}
          homeClub={market?.clubes[match?.clube_casa_id as number]}
          awayClub={market?.clubes[match?.clube_visitante_id as number]}
        />
        <Tabs tabs={tabs} />
      </View>
    </SafeAreaViewContainer>
  );
};

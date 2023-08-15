import { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { Text, View } from "@/components/Themed";
import { MatchCard } from "@/components/contexts/matches/MatchCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ITabs, Tabs } from "@/components/structure/Tabs";
import Colors from "@/constants/Colors";
import { Match } from "@/models/Matches";
import { useGetMarket, useGetMarketStatus } from "@/queries/market.query";

export default () => {
  const colorTheme = useColorScheme();

  const { id } = useLocalSearchParams();

  const { data: marketStatus } = useGetMarketStatus();
  const { data: market } = useGetMarket();

  const [match, setMatch] = useState<Match>();

  const [homeTeamPlayers, setHomeTeamPlayers] = useState();
  const [awayTeamPlayers, setAwayTeamPlayers] = useState();

  const tabs: ITabs[] = useMemo(
    () => [
      {
        id: 1,
        title: market?.clubes[match?.clube_casa_id as number]?.nome as string,
        content: () => {
          return (
            <View>
              <Text>Testando</Text>
            </View>
          );
        },
      },
      {
        id: 2,
        title: market?.clubes[match?.clube_visitante_id as number]
          ?.nome as string,
        content: () => {
          return (
            <View>
              <Text>Testando</Text>
            </View>
          );
        },
      },
    ],
    [market, match]
  );

  useEffect(() => {
    if (id) {
      const match = JSON.parse(id as string);
      setMatch(match);
    }
  }, [id]);

  if (!market || !match) {
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

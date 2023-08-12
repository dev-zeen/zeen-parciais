import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  useColorScheme,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SelectDropdown from "react-native-select-dropdown";

import { Text, View } from "@/components/Themed";
import { ListPlayersSale } from "@/components/contexts/team/ListPlayersSale/ListPlayersSale";
import { ListReservePlayers } from "@/components/contexts/team/ListReservePlayers";
import { SoccerField } from "@/components/contexts/team/SoccerField";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { Button } from "@/components/structure/Button";
import { Loading } from "@/components/structure/Loading";
import { Login } from "@/components/structure/Login";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { LINEUPS_DEFAULT_OBJECT } from "@/constants/Formations";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { AuthContext } from "@/contexts/Auth.context";
import { FullClubInfo } from "@/models/Club";
import { LineupPlayers, LineupPosition } from "@/models/Formations";
import { PlayerStats } from "@/models/Stats";
import { useGetMyClub } from "@/queries/club.query";
import { useGetMarketStatus } from "@/queries/market.query";
import { useGetScoredPlayers } from "@/queries/stats.query";
import useTeamLineupStore from "@/store/useTeamLineupStore";
import { numberToString } from "@/utils/parseTo";
import { isLineupComplete, onGetTeamPrice } from "@/utils/team";

import {
  PlayersToSell,
  clearLineup,
  fillLineupOnChangeTacticalFormation,
  fillLineupWithPlayers,
  isEqualLineups,
  onGetDefaultLineupTeam,
  onGetPlayersOnChangePositionSell,
} from "./team.helpers";

export default () => {
  const router = useRouter();

  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { data: marketStatus } = useGetMarketStatus();

  const allowRequests =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const isMarketClose =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const {
    data: club,
    isLoading: isLoadingClub,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(allowRequests);

  const { data: playerStats, refetch: onRefetchStats } =
    useGetScoredPlayers(isMarketClose);

  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const price = useTeamLineupStore((state) => state.price);
  const updatePrice = useTeamLineupStore((state) => state.updatePrice);
  const capitain = useTeamLineupStore((state) => state.capitain);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const defaultLineupTeam = onGetDefaultLineupTeam(
    club?.time.esquema_id as number
  );

  const [tacticalFormation, setTacticalFormation] = useState(defaultLineupTeam);
  const [showSaveLineupButton, setShowSaveLineupButton] = useState(false);
  const [playersToSell, setPlayersToSell] = useState<PlayersToSell[]>();
  const [showModalPlayersToSell, setShowModalPlayersToSell] = useState(false);

  const onCloseModalSell = useCallback(() => {
    setShowModalPlayersToSell(false);
    setTacticalFormation(defaultLineupTeam);
    handleResetClub();
  }, []);

  const handleCloseSuccessSellPlayers = useCallback(
    (lineup: LineupPlayers, tacticalFormation: string) => {
      setShowModalPlayersToSell(false);
      const lineupUpdated = fillLineupOnChangeTacticalFormation(
        lineup,
        tacticalFormation,
        playerStats,
        isMarketClose
      );

      updateLineup(lineupUpdated);
    },
    []
  );

  const handleChangeFormation = useCallback(
    (lineup: LineupPlayers, value: number) => {
      const newFormation = onGetDefaultLineupTeam(value);

      setTacticalFormation(newFormation);

      if ((LINEUPS_DEFAULT_OBJECT as any)[value] === tacticalFormation) return;

      const playersToSell = onGetPlayersOnChangePositionSell(
        lineup as LineupPlayers,
        newFormation
      );

      if (Object.keys(playersToSell).length) {
        setPlayersToSell(playersToSell);
        setShowModalPlayersToSell(true);
      }
    },
    []
  );

  const onShowSaveLineupButton = useCallback(
    (lineup: LineupPlayers, club: FullClubInfo) => {
      const lineupIsCompleted = isEqualLineups(lineup, club);
      setShowSaveLineupButton(!lineupIsCompleted);
    },
    []
  );

  const handleResetClub = useCallback(async () => {
    await onRefetchClub().then((res) => {
      const defaultFormation = onGetDefaultLineupTeam(
        res.data?.time.esquema_id as number
      );
      setTacticalFormation(defaultFormation);

      const defaultLineupFilled = fillLineupWithPlayers(
        res.data as FullClubInfo,
        defaultFormation,
        playerStats as PlayerStats,
        isMarketClose
      );
      updateLineup(defaultLineupFilled);
      updateCapitain(res.data?.capitao_id as number);
    });
  }, [club]);

  const onRefetch = useCallback(async () => {
    await onRefetchStats();
    await handleResetClub();
  }, [handleResetClub, onRefetchStats]);

  const listDefaultLineups = useMemo(
    () => Object.entries(LINEUPS_DEFAULT_OBJECT).map(([_key, value]) => value),
    []
  );

  const handleSellAllPlayers = useCallback(() => {
    const emptyLineup = clearLineup(lineup?.starting as LineupPosition[]);
    const emptyReserves = clearLineup(lineup?.reserves as LineupPosition[]);
    const newPrice = 0;

    const lineupWithoutPlayers: LineupPlayers = {
      starting: [...(emptyLineup as LineupPosition[])],
      reserves: [...(emptyReserves as LineupPosition[])],
    };

    updateLineup(lineupWithoutPlayers);
    updatePrice(newPrice);
  }, [lineup, updateLineup]);

  const handlePressShowMarketModal = useCallback(() => {
    router.push("/team/market/");
  }, []);

  useEffect(() => {
    if (club) {
      const defaultLineup = fillLineupWithPlayers(
        club,
        (LINEUPS_DEFAULT_OBJECT as any)[club?.time.esquema_id as number],
        playerStats as PlayerStats,
        isMarketClose
      );

      updateLineup(defaultLineup);
      updateCapitain(club.capitao_id);
    }
  }, []);

  useEffect(() => {
    if (lineup) {
      const isFilledLineup = isLineupComplete(lineup);
      if (isFilledLineup) {
        onShowSaveLineupButton(lineup as LineupPlayers, club as FullClubInfo);
      }
    }
  }, [lineup]);

  useEffect(() => {
    if (lineup) {
      const priceUpdated = onGetTeamPrice(lineup?.starting as LineupPosition[]);
      updatePrice(priceUpdated);
    }
  }, [lineup]);

  const isRefetching = useMemo(() => isRefetchingClub, [isRefetchingClub]);

  if (!isAutheticated) {
    return (
      <Login title="Para acessar o seu time, é necessário efetuar o login no Cartola FC." />
    );
  }

  if (!club || isLoadingClub || !lineup) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        className="flex-1 px-2"
        refreshControl={
          <RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />
        }
      >
        <View
          className={`justify-center items-center pb-2 ${
            colorTheme === "dark" ? `bg-dark` : "bg-light"
          }`}
          style={{ gap: 8 }}
        >
          <MarketStatusCard />

          <View className="w-full flex-1 flex-row items-center rounded-lg p-3 justify-evenly">
            <View className="justify-center items-center">
              <Text className="font-light text-sm">Patrim.</Text>
              <Text className="font-bold text-base">
                {numberToString(club?.patrimonio)}
              </Text>
            </View>

            <View className="justify-center items-center">
              <Text className="font-light text-sm">Preço</Text>
              <Text className="font-bold text-base text-green-500">
                {numberToString(price)}
              </Text>
            </View>

            <Button
              variant="error"
              onPress={handleSellAllPlayers}
              onlyIcon
              hasIcon
              iconName="trash"
            />
            <Button
              onPress={handleResetClub}
              onlyIcon
              hasIcon
              iconName="refresh-cw"
            />
            <Button
              variant="secondary"
              onPress={handlePressShowMarketModal}
              onlyIcon
              hasIcon
              iconName="briefcase"
            />
          </View>

          <View className="w-full flex-1 flex-row items-center rounded-lg p-3 justify-evenly">
            <SelectDropdown
              disabled={isMarketClose}
              dropdownIconPosition="right"
              renderDropdownIcon={() => {
                return (
                  <Feather name="chevron-down" size={18} color={"#374151"} />
                );
              }}
              defaultValue={tacticalFormation}
              data={listDefaultLineups}
              onSelect={(_selectedItem, index) => {
                handleChangeFormation(lineup, index + 1);
              }}
              buttonTextAfterSelection={(_selectedItem, _index) => {
                return tacticalFormation;
              }}
              rowTextForSelection={(item, _index) => {
                return item;
              }}
              dropdownStyle={{
                borderRadius: 16,
              }}
              rowTextStyle={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#374151",
              }}
              rowStyle={{
                backgroundColor: "#f5f5f5",
              }}
              buttonStyle={{
                borderRadius: 16,
                maxWidth: 100,
                maxHeight: 40,
                backgroundColor: "#f5f5f5",
              }}
              buttonTextStyle={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#374151",
              }}
            />
          </View>

          {/* <View
          className="flex-row w-full justify-center items-center rounded-md p-3"
          style={{
            gap: 4,
          }}>
          <Icon name="info" size={14} />
          <Text className="text-gray-200 text-xs">
            Para selecionar o capitão, mantenha pressionado no jogador
          </Text>
        </View> */}

          {showSaveLineupButton && (
            <Button
              title="Confirmar Escalação"
              onPress={() => console.log("Confirmar Escalação")}
            />
          )}

          <SoccerField
            capitain={capitain}
            isMarketClose={isMarketClose}
            handleChangeCapitain={updateCapitain}
          />

          <ListReservePlayers lineup={lineup} isMarketClose={isMarketClose} />

          {showModalPlayersToSell && (
            <Modal
              animationType="slide"
              transparent
              visible={showModalPlayersToSell}
            >
              <ListPlayersSale
                players={playersToSell as PlayersToSell[]}
                handleCloseSuccessSellPlayers={handleCloseSuccessSellPlayers}
                handleClose={onCloseModalSell}
                tacticalFormation={tacticalFormation}
              />
            </Modal>
          )}
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

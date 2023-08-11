import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  useColorScheme,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";

import { Market } from "@/app/(tabs)/team/market";
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
import { onGetTeamPrice } from "@/utils/team";
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
  const firstRender = useRef(true);

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
  const [showMarketModal, setShowMarketModal] = useState(false);

  const onCloseModalSell = useCallback(() => {
    setShowModalPlayersToSell(false);
    setTacticalFormation(defaultLineupTeam);
    handleResetClub();
  }, []);

  console.log("render index team?");

  const handleCloseSuccessSellPlayers = useCallback(
    (lineup: LineupPlayers, tacticalFormation: string) => {
      console.log("Inicio handleCloseSuccessSellPlayers");

      setShowModalPlayersToSell(false);
      const lineupUpdated = fillLineupOnChangeTacticalFormation(
        lineup,
        tacticalFormation,
        playerStats,
        isMarketClose
      );

      updateLineup(lineupUpdated);

      console.log("fim handleCloseSuccessSellPlayers");
    },
    [lineup]
  );

  const handleChangeFormation = useCallback(
    (value: number) => {
      console.log("Inicio handleChangeFormation");

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

      console.log("fim handleChangeFormation");
    },
    [lineup]
  );

  const onShowSaveLineupButton = useCallback(
    (lineup: LineupPlayers, club: FullClubInfo) => {
      console.log("Inicio onUpdateShowSaveLineupButton");

      const lineupIsCompleted = isEqualLineups(lineup, club);

      setShowSaveLineupButton(!lineupIsCompleted);

      console.log("Fim onUpdateShowSaveLineupButton");
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
    console.log("Inicio handleSellAllPlayers");

    const emptyLineup = clearLineup(lineup?.players as LineupPosition[]);
    const emptyReserves = clearLineup(lineup?.reserves as LineupPosition[]);
    const newPrice = 0;

    const lineupWithoutPlayers: LineupPlayers = {
      players: [...(emptyLineup as LineupPosition[])],
      reserves: [...(emptyReserves as LineupPosition[])],
    };

    updateLineup(lineupWithoutPlayers);
    updatePrice(newPrice);

    console.log("Fim handleSellAllPlayers");
  }, [lineup, updateLineup]);

  useEffect(() => {
    console.log("Inicio useEffect 1");
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
    console.log("Fim useEffect 1");
  }, []);

  useEffect(() => {
    console.log("Inicio useEffect 2");

    if (lineup) {
      const isFilledLineup = lineup?.players.every((item) => item.player);
      console.log("isFilledLineup", isFilledLineup);

      if (isFilledLineup) {
        onShowSaveLineupButton(lineup as LineupPlayers, club as FullClubInfo);
      }
    }

    console.log("Fim useEffect 2");
  }, [lineup]);

  useEffect(() => {
    if (firstRender.current && lineup) {
      const priceUpdated = onGetTeamPrice(lineup?.players as LineupPosition[]);
      updatePrice(priceUpdated);

      firstRender.current = false;
    }
  }, [lineup]);

  const handlePressShowMarketModal = useCallback(() => {
    setShowMarketModal((previous) => !previous);
  }, []);

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
          className={`justify-center items-center ${
            colorTheme === "dark" ? `bg-dark` : "bg-light"
          }`}
          style={{ gap: 8 }}
        >
          <MarketStatusCard />

          <View className="w-full flex-1 flex-row items-center rounded-lg p-3 justify-between">
            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Patrim.</Text>
              <Text className="font-bold text-xs">
                {numberToString(club?.patrimonio)}
              </Text>
            </View>

            <View className="justify-center items-center gap-1">
              <Text className="font-light text-xs">Preço</Text>
              <Text className="font-bold text-xs text-green-500">
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
                handleChangeFormation(index + 1);
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
            lineup={lineup}
            capitain={capitain}
            isMarketClose={isMarketClose}
            handleChangeCapitain={updateCapitain}
          />

          <ListReservePlayers lineup={lineup} isMarketClose={isMarketClose} />

          {showMarketModal && (
            <Modal animationType="slide" transparent visible={showMarketModal}>
              <Market handleCloseMarketModal={handlePressShowMarketModal} />
            </Modal>
          )}

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

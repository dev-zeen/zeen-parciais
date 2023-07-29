import React, { useCallback, useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme } from "react-native";

import SelectDropdown from "react-native-select-dropdown";

import { ListReservePlayers } from "@/components/contexts/team/ListReservePlayers";
import { Button } from "@/components/structure/Button";

import { SCHEMAS_LIST, SCHEMAS_OBJECT } from "@/constants/Formations";

import { FullClubInfo } from "@/models/Club";
import { FormationPlayer, ISchema } from "@/models/Formations";
import { PlayersStats } from "@/models/Stats";

import { numberToString } from "@/utils/parseTo";

import { MARKET_STATUS_NAME } from "@/constants/Market";
import { useGetMyClub } from "@/queries/club";
import { useGetMarketStatus } from "@/queries/market";
import { useGetScoredPlayers } from "@/queries/stats";
import { onGetTeamPrice } from "@/utils/team";
import { Modal } from "react-native";

import { Text, View } from "@/components/Themed";
import { ListPlayersSale } from "@/components/contexts/team/ListPlayersSale/ListPlayersSale";
import { SoccerField } from "@/components/contexts/team/SoccerField";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { AuthContext } from "@/contexts/Auth.context";
import useTeamSchemaStore from "@/store/useTeamSchemaStore";
import { Feather } from "@expo/vector-icons";
import {
  PlayersToSell,
  fillFormationWithPlayers,
  onCheckSchemaIsCompleted,
  onGetDefaultFormation,
  onGetPlayersOnChangePositionSell,
} from "./team.helpers";

export default () => {
  const colorTheme = useColorScheme();
  const { isAutheticated } = useContext(AuthContext);

  const {
    data: club,
    isLoading: isLoadingClub,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(isAutheticated);

  const { data: marketStatus } = useGetMarketStatus();

  const marketIsClosed =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const { data: playersStats, refetch: onRefetchStats } = useGetScoredPlayers();

  const updateSchema = useTeamSchemaStore((state) => state.updateSchema);
  const schema = useTeamSchemaStore((state) => state.schema);
  const price = useTeamSchemaStore((state) => state.price);
  const updatePrice = useTeamSchemaStore((state) => state.updatePrice);

  const capitain = useTeamSchemaStore((state) => state.capitain);
  const updateCapitain = useTeamSchemaStore((state) => state.updateCapitain);

  const teamFormationDefault = onGetDefaultFormation(
    club?.time.esquema_id as number
  );
  const isRefetching = isRefetchingClub;

  const [formation, setFormation] = useState(teamFormationDefault);
  const [showTeamRegistrationButton, setShowTeamRegistrationButton] =
    useState(false);

  const [playersToSell, setPlayersToSell] = useState<PlayersToSell[]>();
  const [showModalPlayersToSell, setShowModalPlayersToSell] = useState(false);

  const onCloseModalSell = useCallback(() => {
    setShowModalPlayersToSell(false);
    setFormation(teamFormationDefault);
  }, []);

  const handleCloseSuccessSellPlayers = useCallback(() => {
    setShowModalPlayersToSell(false);
    onFillNewFormation(formation);
  }, [schema, formation]);

  const onFillNewFormation = useCallback(
    (newFormation: string) => {
      const updatedFormation = fillFormationWithPlayers(
        club as FullClubInfo,
        newFormation,
        playersStats as PlayersStats,
        marketIsClosed
      );
      updateSchema(updatedFormation);
    },
    [club, playersStats, marketIsClosed, schema]
  );

  const handleChangeFormation = useCallback(
    (value: number) => {
      const newFormation = (SCHEMAS_OBJECT as any)[value];
      if ((SCHEMAS_OBJECT as any)[value] === formation) return;

      setFormation(newFormation);
      const playersToSell = onGetPlayersOnChangePositionSell(
        schema as ISchema,
        newFormation
      );

      if (!Object.keys(playersToSell).length) {
        onFillNewFormation(newFormation);
      } else {
        setPlayersToSell(playersToSell);
        setShowModalPlayersToSell(true);
      }
    },
    [schema]
  );

  const onUpdateShowTeamRegistrationButton = useCallback(
    (schema: ISchema, club: FullClubInfo, capitain: number) => {
      const schemaIsCompleted = onCheckSchemaIsCompleted(
        schema,
        club,
        capitain
      );
      setShowTeamRegistrationButton(schemaIsCompleted);
    },
    [schema]
  );

  const handleResetClub = useCallback(async () => {
    await onRefetchClub().then((res) => {
      const defaultFormation = onGetDefaultFormation(
        res.data?.time.esquema_id as number
      );
      setFormation(defaultFormation);

      const defaultSchemaFilled = fillFormationWithPlayers(
        res.data as FullClubInfo,
        defaultFormation,
        playersStats as PlayersStats,
        marketIsClosed
      );
      updateSchema(defaultSchemaFilled);
    });
  }, [club]);

  const onRefetch = useCallback(async () => {
    await onRefetchStats();
    handleResetClub();
  }, [handleResetClub, onRefetchStats]);

  const handleSellAllPlayers = useCallback(
    (schema: ISchema) => {
      const clearSchema = (formation: FormationPlayer[]) => {
        return formation.map((item) => {
          return {
            ...item,
            player: undefined,
          };
        });
      };

      const clearPlayers = clearSchema(schema.players);
      const clearReserves = clearSchema(schema?.reserves as FormationPlayer[]);

      const schemaWithoutPlayers: ISchema = {
        players: [...(clearPlayers as FormationPlayer[])],
        reserves: [...(clearReserves as FormationPlayer[])],
      };

      updateSchema(schemaWithoutPlayers);
    },
    [schema]
  );

  useEffect(() => {
    if (schema) {
      const priceUpdated = onGetTeamPrice(schema?.players as FormationPlayer[]);
      updatePrice(priceUpdated);
    }
  }, [schema]);

  useEffect(() => {
    if (club) {
      const defaultSchema = fillFormationWithPlayers(
        club,
        (SCHEMAS_OBJECT as any)[club?.time.esquema_id as number],
        playersStats as PlayersStats,
        marketIsClosed
      );
      updateSchema(defaultSchema);
      updateCapitain(club.capitao_id);
    }
  }, [club]);

  useEffect(() => {
    if (schema) {
      onUpdateShowTeamRegistrationButton(
        schema as ISchema,
        club as FullClubInfo,
        capitain
      );
    }
  }, [schema]);

  if (!club || isLoadingClub || !schema) {
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

            <SelectDropdown
              disabled={marketIsClosed}
              dropdownIconPosition="right"
              renderDropdownIcon={() => {
                return (
                  <Feather name="chevron-down" size={18} color={"#374151"} />
                );
              }}
              defaultValue={formation}
              data={SCHEMAS_LIST}
              onSelect={(_selectedItem, index) => {
                handleChangeFormation(index + 1);
              }}
              buttonTextAfterSelection={(_selectedItem, _index) => {
                return formation;
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

            <Button
              variant="warning"
              onPress={() => handleSellAllPlayers(schema)}
              onlyIcon
              hasIcon
              iconName="trash"
            />
            <Button
              onPress={() => handleResetClub()}
              onlyIcon
              hasIcon
              iconName="refresh-cw"
            />
          </View>

          {/* <View
          className="flex-row w-full justify-center items-center bg-white rounded-md p-3"
          style={{
            gap: 4,
          }}>
          <Icon name="info" size={14} />
          <Text className="text-gray-600 text-xs">
            Para selecionar o capitão, mantenha pressionado no jogador
          </Text>
        </View> */}

          {showTeamRegistrationButton && (
            <Button
              title="Confirmar Escalação"
              onPress={() => console.log("Confirmar Escalação")}
            />
          )}

          <SoccerField
            schema={schema}
            capitain={capitain}
            handleChangeCapitain={updateCapitain}
          />

          <ListReservePlayers schema={schema} />

          <Modal
            animationType="slide"
            transparent
            visible={showModalPlayersToSell}
          >
            <ListPlayersSale
              players={playersToSell as PlayersToSell[]}
              handleCloseSuccessSellPlayers={handleCloseSuccessSellPlayers}
              handleClose={onCloseModalSell}
            />
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

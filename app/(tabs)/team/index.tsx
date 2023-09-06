import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, RefreshControl, ScrollView, useColorScheme } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

import {
  PlayersToSell,
  clearLineup,
  emptyCapitain,
  emptyLineupFormation,
  emptyReservePlayers,
  fillLineupOnChangeTacticalFormation,
  fillLineupWithPlayers,
  fillPlayersInLineup,
  listDefaultLineups,
  onClearLineup,
  onGetDefaultLineupTeam,
  onGetEqualLineups,
  onGetPlayersOnChangePositionSell,
  onSuccessSavedTeam,
} from './team.helpers';

import { Text, View } from '@/components/Themed';
import { ListPlayersSale } from '@/components/contexts/team/ListPlayersSale/ListPlayersSale';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { Button } from '@/components/structure/Button';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { FORMATIONS, LINEUPS_DEFAULT_OBJECT } from '@/constants/Formations';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer, PlayerStats } from '@/models/Stats';
import { useGetMatchSubstitutions, useGetMyClub, useSaveTeam } from '@/queries/club.query';
import { useGetMarketStatus } from '@/queries/market.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { numberToString } from '@/utils/parseTo';
import { isLineupComplete, onGetPayloadSaveTeam, onGetTeamPrice } from '@/utils/team';

export default () => {
  const isFirstRender = useRef(true);

  const router = useRouter();

  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { data: marketStatus } = useGetMarketStatus();

  const allowRequest =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const {
    data: club,
    refetch: onRefetchClub,
    isRefetching: isRefetchingClub,
  } = useGetMyClub(!!allowRequest);

  const { data: playerStats, refetch: onRefetchStats } = useGetScoredPlayers(isMarketClose);

  const { data: substitutions } = useGetMatchSubstitutions({
    id: club?.time.time_id,
  });

  const { mutate, isSuccess } = useSaveTeam();

  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const price = useTeamLineupStore((state) => state.price);
  const updatePrice = useTeamLineupStore((state) => state.updatePrice);
  const capitain = useTeamLineupStore((state) => state.capitain);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const defaultLineupTeam = useMemo(
    () => onGetDefaultLineupTeam(club?.time.esquema_id as number),
    [club]
  );

  const [tacticalFormation, setTacticalFormation] = useState(defaultLineupTeam);
  const [isActiveLineupConfirmButton, setIsActiveLineupConfirmButton] = useState(false);
  const [playersToSell, setPlayersToSell] = useState<PlayersToSell[]>();
  const [showModalPlayersToSell, setShowModalPlayersToSell] = useState(false);

  const handleResetClub = useCallback(async () => {
    await onRefetchClub().then((res) => {
      const defaultFormation = onGetDefaultLineupTeam(res.data?.time.esquema_id as number);
      setTacticalFormation(defaultFormation);

      const defaultLineupFilled = fillLineupWithPlayers(
        res.data as FullClubInfo,
        defaultFormation,
        playerStats as PlayerStats,
        isMarketClose
      );
      const defaultPrice = onGetTeamPrice(defaultLineupFilled.starting);
      updatePrice(defaultPrice);

      updateLineup(defaultLineupFilled);
      updateCapitain(res.data?.capitao_id as number);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMarketClose, playerStats]);

  const onCloseModalSell = useCallback(() => {
    setShowModalPlayersToSell(false);
    setTacticalFormation(defaultLineupTeam);
    handleResetClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLineupTeam, handleResetClub]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMarketClose, playerStats]
  );

  const handleChangeFormation = useCallback(
    (lineup: LineupPlayers, value: number) => {
      const isExistsPlayerOnLineup = lineup.starting.some((item) => item.player);

      const newFormation = onGetDefaultLineupTeam(value);

      setTacticalFormation(newFormation);

      if ((LINEUPS_DEFAULT_OBJECT as any)[value] === tacticalFormation) return;

      if (!isExistsPlayerOnLineup) {
        const lineupUpdated: LineupPlayers = onClearLineup(FORMATIONS[newFormation]);
        updateLineup(lineupUpdated);
        return;
      }

      const playersToSell = onGetPlayersOnChangePositionSell(lineup as LineupPlayers, newFormation);

      if (!playersToSell.length) {
        const lineupUpdated = FORMATIONS[newFormation];

        fillPlayersInLineup({
          players: lineup.starting.map((item) => item.player) as FullPlayer[],
          arrayFillTarget: lineupUpdated.starting,
          playerStats,
          isMarketClose,
        });

        updateLineup(lineupUpdated);
        return;
      }

      if (Object.keys(playersToSell).length && isExistsPlayerOnLineup) {
        setPlayersToSell(playersToSell);
        setShowModalPlayersToSell(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMarketClose, playerStats, tacticalFormation]
  );

  const onRefetch = useCallback(async () => {
    await onRefetchStats();
    await handleResetClub();
  }, [handleResetClub, onRefetchStats]);

  const onSaveTeam = useCallback(() => {
    const payload = onGetPayloadSaveTeam({
      lineup: lineup as LineupPlayers,
      capitain,
      tacticalFormation,
    });

    mutate(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineup, capitain, tacticalFormation]);

  useEffect(() => {
    if (isSuccess) {
      onSuccessSavedTeam();
      onRefetchClub();
      setIsActiveLineupConfirmButton(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const isReservesCompleted = useCallback((reserves: LineupPosition[]) => {
    return reserves.every((item) => item.player);
  }, []);

  const handleSaveTeam = useCallback(() => {
    if (!tacticalFormation) {
      emptyLineupFormation();
      return;
    }

    if (!capitain) {
      emptyCapitain();
      return;
    }

    if (!isReservesCompleted(lineup?.reserves as LineupPosition[])) {
      emptyReservePlayers(onSaveTeam);
      return;
    }
    onSaveTeam();
  }, [capitain, isReservesCompleted, lineup?.reserves, onSaveTeam, tacticalFormation]);

  const handlePressShowMarketModal = useCallback(() => {
    router.push('/team/market/');
  }, [router]);

  const onShowSaveLineupButton = useCallback(
    (lineup: LineupPlayers, capitain: number, club: FullClubInfo) => {
      if (lineup && club) {
        const isEqualLineups = onGetEqualLineups(lineup, club);
        const isSameCapitain = club.capitao_id === capitain;

        if (!isSameCapitain || !isEqualLineups) setIsActiveLineupConfirmButton(true);
        if (isSameCapitain && isEqualLineups) setIsActiveLineupConfirmButton(false);
      }
    },
    []
  );

  const handleSellAllPlayers = useCallback((lineup: LineupPlayers) => {
    const emptyLineup = clearLineup(lineup?.starting as LineupPosition[]);
    const emptyReserves = clearLineup(lineup?.reserves as LineupPosition[]);
    const newPrice = 0;

    const lineupWithoutPlayers: LineupPlayers = {
      starting: [...(emptyLineup as LineupPosition[])],
      reserves: [...(emptyReserves as LineupPosition[])],
    };

    updateLineup(lineupWithoutPlayers);
    updateCapitain(0);
    updatePrice(newPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lineup && club) {
      const defaultLineup = fillLineupWithPlayers(
        club,
        (LINEUPS_DEFAULT_OBJECT as any)[club?.time.esquema_id as number],
        playerStats as PlayerStats,
        isMarketClose
      );

      updateLineup(defaultLineup);
      updateCapitain(club.capitao_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club, isMarketClose, lineup, playerStats]);

  useEffect(() => {
    if (lineup && club) {
      const isFilledLineup = isLineupComplete(lineup);

      if (isFilledLineup) {
        onShowSaveLineupButton(lineup as LineupPlayers, capitain, club as FullClubInfo);
      } else {
        setIsActiveLineupConfirmButton(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capitain, club, lineup]);

  useEffect(() => {
    if (lineup && isFirstRender) {
      const priceUpdated = onGetTeamPrice(lineup?.starting as LineupPosition[]);
      updatePrice(priceUpdated);

      isFirstRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineup]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isRefetching = useMemo(() => isRefetchingClub, [isRefetchingClub]);

  if (!isAutheticated) {
    return <Login title="Para acessar o seu time, é necessário efetuar o login no Cartola FC." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (!club || !lineup) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        className="flex-1 px-2"
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}>
        <View
          className={`justify-center items-center pb-2 ${
            colorTheme === 'dark' ? `bg-dark` : 'bg-light'
          }`}
          style={{ gap: 8 }}>
          <MarketStatusCard />

          <View className="w-full flex-1 flex-row items-center rounded-lg px-2 py-3 justify-around">
            <View className="w-16 justify-center items-center">
              <Text className="font-light text-sm">Patrim.</Text>
              <Text className="font-semibold text-base">{numberToString(club?.patrimonio)}</Text>
            </View>

            <View className="w-16 justify-center items-center">
              <Text className="font-light text-sm">Preço</Text>
              <Text className="font-semibold text-base text-green-500">
                {numberToString(price)}
              </Text>
            </View>

            <View className="w-16 justify-center items-center">
              <Text className="font-light text-sm">Rest.</Text>
              <Text className="font-semibold text-base text-green-500">
                {numberToString(club?.patrimonio - (price as number))}
              </Text>
            </View>

            <Button
              variant={isMarketClose ? 'disabled' : 'error'}
              onPress={() => handleSellAllPlayers(lineup)}
              onlyIcon
              hasIcon
              iconName="trash"
              disabled={isMarketClose}
            />
            <Button
              onPress={handleResetClub}
              variant="primary"
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

          <View className="w-full flex-row items-center rounded-lg p-3 justify-between">
            <SelectDropdown
              disabled={isMarketClose}
              dropdownIconPosition="right"
              renderDropdownIcon={() => {
                return <Feather name="chevron-down" size={18} color={'#374151'} />;
              }}
              defaultValue={tacticalFormation}
              defaultButtonText="Selecione"
              data={listDefaultLineups()}
              onSelect={(_selectedItem, index) => {
                handleChangeFormation(lineup, index + 1);
              }}
              buttonTextAfterSelection={(_selectedItem, _index) => {
                return tacticalFormation;
              }}
              rowTextForSelection={(item, _index) => {
                return item;
              }}
              rowTextStyle={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#374151',
              }}
              rowStyle={{
                backgroundColor: '#f5f5f5',
              }}
              buttonStyle={{
                borderRadius: 4,
                borderBottomWidth: !isMarketClose ? 2 : 0,
                borderBottomColor: !isMarketClose ? '#3b82f6' : '',
                maxWidth: 120,
                maxHeight: 40,
                backgroundColor:
                  colorTheme === 'dark'
                    ? !isMarketClose
                      ? 'white'
                      : '#9ca3af'
                    : !isMarketClose
                    ? 'white'
                    : '#d1d5db',
              }}
              buttonTextStyle={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#374151',
              }}
            />

            <View className="w-16 justify-center items-center">
              <Text className="font-medium text-xs">Reservas</Text>
              <Text className="font-semibold text-sm">
                {lineup.reserves.filter((item) => item.player).length}/{lineup.reserves.length}
              </Text>
            </View>

            <Button
              variant="success"
              title="Confirmar"
              onPress={handleSaveTeam}
              iconName="check"
              hasIcon
              disabled={!isActiveLineupConfirmButton}
            />
          </View>

          <SoccerField isMarketClose={isMarketClose} substitutions={substitutions} />

          <ListReservePlayers
            lineup={lineup}
            isMarketClose={isMarketClose}
            substitutions={substitutions}
          />

          {showModalPlayersToSell && (
            <Modal animationType="fade" transparent visible={showModalPlayersToSell}>
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

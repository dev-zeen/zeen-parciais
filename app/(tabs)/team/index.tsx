import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Modal, RefreshControl, ScrollView, useColorScheme } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

import {
  PlayersToSell,
  clearLineup,
  emptyCapitain,
  emptyLineupFormation,
  emptyReservePlayers,
  fillLineupOnChangeFormation,
  fillLineupWithPlayers,
  fillPlayersInLineup,
  listDefaultLineups,
  onClearLineup,
  onGetDefaultLineupTeam,
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
import useLineup from '@/hooks/useLineup';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import usePlayerStats from '@/hooks/usePlayerStats';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer, PlayerStats } from '@/models/Stats';
import { numberToString } from '@/utils/parseTo';
import { onGetTeamPrice } from '@/utils/team';

export default () => {
  const router = useRouter();

  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { myClub, onRefetchMyClub, isRefetchingMyClub } = useMyClub();

  const { playerStats, onRefetchStats } = usePlayerStats();

  const {
    initialLineupTeamFormation,
    isSuccessSaveTeam,
    onSaveTeam,
    isReservesCompleted,
    isLineupComplete,
    lineup,
    updateLineup,
    price,
    updatePrice,
    capitain,
    updateCapitain,
    formation,
    updateFormation,
  } = useLineup();

  const [playersToSell, setPlayersToSell] = useState<PlayersToSell[]>();
  const [showModalPlayersToSell, setShowModalPlayersToSell] = useState(false);

  const handleResetClub = useCallback(async () => {
    if (onRefetchMyClub)
      await onRefetchMyClub().then((res) => {
        updateFormation(initialLineupTeamFormation);

        const initialLineupMounted = fillLineupWithPlayers(
          res.data as FullClubInfo,
          initialLineupTeamFormation,
          playerStats as PlayerStats,
          isMarketClose
        );
        const defaultPrice = onGetTeamPrice(initialLineupMounted.starting);
        updatePrice(defaultPrice);

        updateLineup(initialLineupMounted);
        updateCapitain(res.data?.capitao_id as number);
      });
  }, [
    onRefetchMyClub,
    updateFormation,
    initialLineupTeamFormation,
    playerStats,
    isMarketClose,
    updatePrice,
    updateLineup,
    updateCapitain,
  ]);

  const onCloseSellPlayersModal = useCallback(() => {
    setShowModalPlayersToSell(false);
    updateFormation(initialLineupTeamFormation);
    handleResetClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLineupTeamFormation, handleResetClub]);

  const handleCloseSuccessSellPlayers = useCallback(
    (lineup: LineupPlayers) => {
      setShowModalPlayersToSell(false);
      const lineupUpdated = fillLineupOnChangeFormation(
        lineup,
        formation,
        playerStats,
        isMarketClose
      );

      updateLineup(lineupUpdated);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formation, playerStats, isMarketClose]
  );

  const handleChangeFormation = useCallback(
    (lineup: LineupPlayers, formation: number) => {
      const newFormation = onGetDefaultLineupTeam(formation);
      updateFormation(newFormation);

      if ((LINEUPS_DEFAULT_OBJECT as any)[formation] === formation) return;

      const isExistsPlayerOnLineup = lineup.starting.some((item) => item.player);
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
    [isMarketClose, playerStats, formation]
  );

  const handleSaveTeam = useCallback(() => {
    if (!formation) {
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
  }, [capitain, isReservesCompleted, lineup?.reserves, onSaveTeam, formation]);

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

  const handlePressMarket = useCallback(() => {
    router.push('/team/market/');
  }, [router]);

  useEffect(() => {
    if (isSuccessSaveTeam) {
      onSuccessSavedTeam();
      onRefetchMyClub && onRefetchMyClub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessSaveTeam]);

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchStats(), handleResetClub()]);
  }, [handleResetClub, onRefetchStats]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isRefetching = useMemo(() => isRefetchingMyClub, [isRefetchingMyClub]);

  if (!isAutheticated) {
    return <Login title="Para acessar o seu time, é necessário efetuar o login." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (!myClub || !lineup) {
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
              <Text className="font-semibold text-base">{numberToString(myClub?.patrimonio)}</Text>
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
                {numberToString(myClub?.patrimonio - (price as number))}
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
              onPress={handlePressMarket}
              variant="secondary"
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
              defaultValue={formation}
              defaultButtonText="Selecione"
              data={listDefaultLineups()}
              onSelect={(_selectedItem, index) => {
                handleChangeFormation(lineup, index + 1);
              }}
              buttonTextAfterSelection={(_selectedItem, _index) => {
                return formation;
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
              disabled={!isLineupComplete}
            />
          </View>

          <SoccerField />

          <ListReservePlayers />

          {showModalPlayersToSell && (
            <Modal animationType="fade" transparent visible={showModalPlayersToSell}>
              <ListPlayersSale
                players={playersToSell as PlayersToSell[]}
                handleCloseSuccessSellPlayers={handleCloseSuccessSellPlayers}
                handleClose={onCloseSellPlayersModal}
              />
            </Modal>
          )}
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

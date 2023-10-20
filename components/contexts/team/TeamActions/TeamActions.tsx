import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, useColorScheme } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

import {
  PlayersToSell,
  clearLineup,
  emptyCaptain,
  emptyLineupFormation,
  emptyReservePlayers,
  fillLineupOnChangeFormation,
  fillPlayersInLineup,
  listDefaultLineups,
  onClearLineup,
  onGetDefaultLineupTeam,
  onGetEqualLineups,
  onGetPlayersOnChangePositionSell,
  onSuccessSavedTeam,
} from '@/app/(tabs)/team/team.helpers';
import { Text, View } from '@/components/Themed';
import { ListPlayersSale } from '@/components/contexts/team/ListPlayersSale';
import { Button } from '@/components/structure/Button';
import Colors from '@/constants/Colors';
import { FORMATIONS, LINEUPS_DEFAULT_OBJECT } from '@/constants/Formations';
import useMarketStatus from '@/hooks/useMarketStatus';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { useGetMyClub, useSaveTeam } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { numberToString } from '@/utils/parseTo';
import { onGetIsLineupComplete, onGetPayloadSaveTeam, onGetTeamPrice } from '@/utils/team';

type TeamActionsProps = {
  initialLineupTeamFormation: string;
  onRefresh?: () => void;
};

export function TeamActions({ initialLineupTeamFormation, onRefresh }: TeamActionsProps) {
  const colorTheme = useColorScheme();

  const isFirstRender = useRef(true);

  const { isMarketClose } = useMarketStatus();

  const { mutate, isSuccess: isSuccessSaveTeam } = useSaveTeam();

  const { data: myClub, refetch: onRefetchMyClub } = useGetMyClub();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);

  const updateCaptain = useTeamLineupStore((state) => state.updateCaptain);
  const captain = useTeamLineupStore((state) => state.captain);

  const updatePrice = useTeamLineupStore((state) => state.updatePrice);
  const price = useTeamLineupStore((state) => state.price);

  const updateFormation = useTeamLineupStore((state) => state.updateFormation);
  const formation = useTeamLineupStore((state) => state.formation);

  const [playersToSell, setPlayersToSell] = useState<PlayersToSell[]>();
  const [showModalPlayersToSell, setShowModalPlayersToSell] = useState(false);
  const [isLineupComplete, setIsLineupComplete] = useState(false);

  const onCloseSellPlayersModal = useCallback(() => {
    setShowModalPlayersToSell(false);
    updateFormation(initialLineupTeamFormation);
    onRefresh && onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefresh, initialLineupTeamFormation]);

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

  const handleSellAllPlayers = useCallback((lineup: LineupPlayers) => {
    const emptyLineup = clearLineup(lineup?.starting as LineupPosition[]);
    const emptyReserves = clearLineup(lineup?.reserves as LineupPosition[]);
    const newPrice = 0;

    const lineupWithoutPlayers: LineupPlayers = {
      starting: [...(emptyLineup as LineupPosition[])],
      reserves: [...(emptyReserves as LineupPosition[])],
    };

    updateLineup(lineupWithoutPlayers);
    updateCaptain(0);
    updatePrice(newPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveTeam = useCallback(() => {
    const payload = onGetPayloadSaveTeam({
      lineup: lineup as LineupPlayers,
      captain,
      formation,
    });

    mutate(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineup, captain, formation]);

  const isReservesCompleted = useCallback((reserves: LineupPosition[]) => {
    return reserves.every((item) => item.player);
  }, []);

  const handleSaveTeam = useCallback(() => {
    if (!formation) {
      emptyLineupFormation();
      return;
    }

    if (!captain) {
      emptyCaptain();
      return;
    }

    if (!isReservesCompleted(lineup?.reserves as LineupPosition[])) {
      emptyReservePlayers(onSaveTeam);
      return;
    }
    onSaveTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captain, formation, lineup]);

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

  const onShowSaveLineupButton = useCallback(
    (lineup: LineupPlayers, captain: number, club: FullClubInfo) => {
      const isEqualLineups = onGetEqualLineups(lineup, club);
      const isSameCaptain = club.capitao_id === captain;

      if (!isSameCaptain || !isEqualLineups) setIsLineupComplete(true);
      if (isSameCaptain && isEqualLineups) setIsLineupComplete(false);
    },
    []
  );

  useEffect(() => {
    if (isSuccessSaveTeam) {
      onSuccessSavedTeam();
      onRefetchMyClub && onRefetchMyClub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessSaveTeam]);

  useEffect(() => {
    if (!formation) updateFormation(initialLineupTeamFormation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lineup && myClub && captain) {
      const isFilledLineup = onGetIsLineupComplete(lineup);

      if (isFilledLineup) {
        onShowSaveLineupButton(lineup as LineupPlayers, captain, myClub as FullClubInfo);
      } else {
        setIsLineupComplete(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captain, myClub, lineup]);

  useEffect(() => {
    if (lineup && isFirstRender.current) {
      const initialPrice = onGetTeamPrice(lineup?.starting);
      updatePrice(initialPrice);

      isFirstRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineup]);

  return (
    <>
      <View className="w-full flex-1 flex-row items-center rounded-lg px-2 py-3 justify-around">
        <View className="w-16 justify-center items-center">
          <Text className="text-sm">Patrim.</Text>
          <Text className="font-semibold text-base">{numberToString(myClub?.patrimonio)}</Text>
        </View>

        <View className="w-16 justify-center items-center">
          <Text className="text-sm">Preço</Text>
          <Text className="font-semibold text-base text-green-500">{numberToString(price)}</Text>
        </View>

        <View className="w-16 justify-center items-center">
          <Text className="text-sm">Rest.</Text>
          <Text className="font-semibold text-base text-green-500">
            {numberToString((myClub?.patrimonio as number) - (price as number))}
          </Text>
        </View>

        <Button
          variant={isMarketClose ? 'disabled' : 'error'}
          onPress={() => handleSellAllPlayers(lineup as LineupPlayers)}
          onlyIcon
          hasIcon
          iconName="trash"
          disabled={isMarketClose}
        />
        <Button onPress={onRefresh} variant="primary" onlyIcon hasIcon iconName="refresh-cw" />
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
            handleChangeFormation(lineup as LineupPlayers, index + 1);
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
            backgroundColor: Colors.light.backgroundFull,
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
            {lineup?.reserves.filter((item) => item.player).length}/{lineup?.reserves.length}
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

      {showModalPlayersToSell && (
        <Modal animationType="fade" transparent visible={showModalPlayersToSell}>
          <ListPlayersSale
            players={playersToSell as PlayersToSell[]}
            handleCloseSuccessSellPlayers={handleCloseSuccessSellPlayers}
            handleClose={onCloseSellPlayersModal}
          />
        </Modal>
      )}
    </>
  );
}

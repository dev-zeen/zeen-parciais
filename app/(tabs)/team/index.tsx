import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, RefreshControl, ScrollView, useColorScheme } from 'react-native';

import type { BottomSheetRef } from '@/components/structure/BottomSheet';

import {
  clearLineup,
  emptyCaptain,
  emptyLineupFormation,
  emptyReservePlayers,
  fillLineupOnChangeFormation,
  listDefaultLineups,
  onClearLineup,
  onGetDefaultLineupTeam,
  onGetEqualLineups,
  onGetFillLineupDefaultPlayers,
  onGetPlayersOnChangePositionSell,
  onSuccessSavedTeam,
  PlayersToSell,
} from './_team.helpers';

import { View } from '@/components/Themed';
import { BottomSheet } from '@/components/structure/BottomSheet';
import { FAB } from '@/components/structure/FAB';
import { Toast } from '@/components/structure/Toast';
import { TeamStatsCard } from '@/components/contexts/team/TeamStatsCard';
import { TeamQuickActions } from '@/components/contexts/team/TeamQuickActions';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import Market from '@/app/(tabs)/team/market';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { FORMATIONS, LINEUPS_DEFAULT_OBJECT } from '@/constants/Formations';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { useGetMatchSubstitutions, useGetMyClub, useSaveTeam } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { onGetIsLineupComplete, onGetPayloadSaveTeam, onGetTeamPrice } from '@/utils/team';

export default () => {
  const colorTheme = useColorScheme();
  const isFirstRender = useRef(true);
  const marketSheetRef = useRef<BottomSheetRef>(null);

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, allowRequest, isMarketClose } = useMarketStatus();

  const { mutate: saveTeam, isSuccess: isSuccessSaveTeam } = useSaveTeam();

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    refetch: onRefetchPlayerStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  const {
    data: myClub,
    isRefetching: isRefetchingMyClub,
    refetch: onRefetchMyClub,
  } = useGetMyClub(allowRequest);

  const { data: substitutions, isInitialLoading: isInitialLoadingSubstitutions } =
    useGetMatchSubstitutions({
      id: myClub?.time.time_id,
    });

  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const updateCaptain = useTeamLineupStore((state) => state.updateCaptain);
  const captain = useTeamLineupStore((state) => state.captain);
  const updatePrice = useTeamLineupStore((state) => state.updatePrice);
  const price = useTeamLineupStore((state) => state.price);
  const updateFormation = useTeamLineupStore((state) => state.updateFormation);
  const formation = useTeamLineupStore((state) => state.formation);

  // Market state
  const [positionMarketSearch, setPositionMarketSearch] = useState<LineupPosition>();
  const [playerIndex, setPlayerIndex] = useState(0);
  const [playerLowestPrice, setPlayerLowestPrice] = useState<LineupPosition>();


  // Save button state
  const [isLineupComplete, setIsLineupComplete] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // Key to force remount of BottomSheet after refresh
  const [bottomSheetKey, setBottomSheetKey] = useState(0);

  const initialLineupTeamFormation = useMemo(
    () => onGetDefaultLineupTeam(myClub?.time?.esquema_id ?? 4),
    [myClub]
  );

  const isRefetching = useMemo(
    () => isRefetchingPlayerStats || isRefetchingMyClub,
    [isRefetchingMyClub, isRefetchingPlayerStats]
  );

  const balance = useMemo(
    () => (myClub?.patrimonio as number) - (price as number),
    [myClub?.patrimonio, price]
  );

  const reservesCount = useMemo(
    () => lineup?.reserves?.filter((item) => item.player).length || 0,
    [lineup?.reserves]
  );

  const mountLineup = useCallback(
    (myTeam: FullClubInfo) => {
      const defaultLineup = onGetFillLineupDefaultPlayers({
        lineupStart: myTeam.atletas ?? [],
        reserves: myTeam.reservas ?? [],
        formationId: myTeam.time?.esquema_id ?? 4,
        playerStats,
        isMarketClose,
      });

      return defaultLineup;
    },
    [isMarketClose, playerStats]
  );

  // Check for changes
  useEffect(() => {
    if (lineup && myClub && captain !== undefined) {
      const isEqualLineups = onGetEqualLineups(lineup, myClub);
      const isSameCaptain = myClub.capitao_id === captain;
      const hasLineupChanges = !isSameCaptain || !isEqualLineups;
      setHasChanges(hasLineupChanges);

      const isFilledLineup = onGetIsLineupComplete(lineup);
      setIsLineupComplete(hasLineupChanges && isFilledLineup);
    }
  }, [lineup, captain, myClub]);

  useEffect(() => {
    if (!lineup && myClub && !isRefetching) {
      const defaultLineup = mountLineup(myClub);
      updateLineup(defaultLineup as LineupPlayers);
      updateCaptain(myClub.capitao_id ?? 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMarketClose, isRefetching, myClub, playerStats]);

  useEffect(() => {
    if (!formation) updateFormation(initialLineupTeamFormation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lineup && isFirstRender.current) {
      const initialPrice = onGetTeamPrice(lineup?.starting);
      updatePrice(initialPrice);
      isFirstRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineup]);

  useEffect(() => {
    if (isSuccessSaveTeam) {
      onSuccessSavedTeam();
      onRefetchMyClub && onRefetchMyClub();
      setHasChanges(false);
      setToastMessage('Time salvo com sucesso!');
      setToastType('success');
      setShowToast(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessSaveTeam]);

  const onRefresh = useCallback(() => {
    // Force remount of BottomSheet to reset SafeAreaView
    setBottomSheetKey((prev) => prev + 1);
    
    Promise.all([onRefetchPlayerStats(), onRefetchMyClub()]).then(([_, { data: myTeamData }]) => {
      const defaultLineup = mountLineup(myTeamData as FullClubInfo);
      const newPrice = onGetTeamPrice(defaultLineup.starting);
      
      updateLineup(defaultLineup);
      updateCaptain(myTeamData?.capitao_id as number);
      updatePrice(newPrice);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMarketClose, onRefetchMyClub, onRefetchPlayerStats, playerStats]);

  const handleOpenMarket = useCallback(
    (position: LineupPosition, index: number, lowestPrice?: LineupPosition) => {
      setPositionMarketSearch(position);
      setPlayerIndex(index);
      if (lowestPrice) {
        setPlayerLowestPrice(lowestPrice);
      }
      marketSheetRef.current?.snapToIndex(1);
    },
    []
  );

  const handleCloseMarket = useCallback(() => {
    marketSheetRef.current?.close();
    setPositionMarketSearch(undefined);
    setPlayerIndex(0);
    setPlayerLowestPrice(undefined);
  }, []);

  const handleClearAll = useCallback(() => {
    if (!lineup) return;
    const emptyLineup = clearLineup(lineup?.starting);
    const emptyReserves = clearLineup(lineup?.reserves);

    const lineupWithoutPlayers: LineupPlayers = {
      starting: [...emptyLineup],
      reserves: [...emptyReserves],
    };

    // Recalculate price for empty lineup (should be 0)
    const newPrice = onGetTeamPrice(lineupWithoutPlayers.starting);

    updateLineup(lineupWithoutPlayers);
    updateCaptain(0);
    updatePrice(newPrice);
    setHasChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineup, updateLineup, updateCaptain, updatePrice]);

  const handleFormationChange = useCallback(
    (formationIndex: number) => {
      const newFormation = onGetDefaultLineupTeam(formationIndex);
      updateFormation(newFormation);

      if (!lineup) return;

      const isExistsPlayerOnLineup = lineup.starting.some((item) => item.player);
      if (!isExistsPlayerOnLineup) {
        const lineupUpdated: LineupPlayers = onClearLineup(FORMATIONS[newFormation]);
        updateLineup(lineupUpdated);
        return;
      }

      const playersToSell = onGetPlayersOnChangePositionSell(lineup as LineupPlayers, newFormation);

      if (!playersToSell.length) {
        const lineupUpdated = fillLineupOnChangeFormation(
          lineup,
          newFormation,
          playerStats,
          isMarketClose
        );
        updateLineup(lineupUpdated);
      }
    },
    [lineup, playerStats, isMarketClose, updateFormation, updateLineup]
  );

  const handleSaveTeam = useCallback(() => {
    if (!formation) {
      emptyLineupFormation();
      return;
    }

    if (!captain) {
      emptyCaptain();
      return;
    }

    const isReservesCompleted = lineup?.reserves?.every((item) => item.player);
    if (!isReservesCompleted) {
      emptyReservePlayers(() => {
        const payload = onGetPayloadSaveTeam({
          lineup: lineup as LineupPlayers,
          captain,
          formation,
        });
        saveTeam(payload);
      });
      return;
    }

    const payload = onGetPayloadSaveTeam({
      lineup: lineup as LineupPlayers,
      captain,
      formation,
    });
    saveTeam(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captain, formation, lineup]);

  if (!isAutheticated) {
    return <Login title="Para acessar o seu time, é necessário efetuar o login." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (
    !myClub ||
    !lineup ||
    isInitialLoadingSubstitutions ||
    isLoadingPlayerStats ||
    !marketStatus
  ) {
    return <LoadingScreen title="Carregando meu time" />;
  }

  return (
    <SafeAreaViewContainer>
        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefetching} />}
          contentContainerStyle={{ paddingBottom: 100 }}>
          <View
            className={`justify-center items-center pb-2 ${
              colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
            }`}
            style={{ gap: 8 }}>
            <TeamStatsCard
              patrimonio={myClub?.patrimonio ?? 0}
              price={price ?? 0}
              balance={balance}
              reservesCount={reservesCount}
              totalReserves={lineup?.reserves?.length || 0}
            />

            <TeamQuickActions
              onRefresh={onRefresh}
              onClearAll={handleClearAll}
              disabled={isMarketClose}
              formation={formation || initialLineupTeamFormation}
              onFormationChange={handleFormationChange}
            />

            <SoccerField
              lineup={lineup}
              captain={captain}
              substitutions={substitutions}
              round={marketStatus?.rodada_atual}
              isViewOnly={isMarketClose}
              onOpenMarket={handleOpenMarket}
            />

            <ListReservePlayers
              lineup={lineup}
              substitutions={substitutions}
              round={marketStatus?.rodada_atual}
              isViewOnly={isMarketClose}
              onOpenMarket={handleOpenMarket}
            />
          </View>
        </ScrollView>

        <FAB
          visible={isLineupComplete && !isMarketClose}
          onPress={handleSaveTeam}
          disabled={!isLineupComplete || isMarketClose}
          label="Salvar Time"
          iconName="check"
        />

        <BottomSheet key={bottomSheetKey} ref={marketSheetRef} snapPoints={['70%', '95%']}>
          <Market
            position={positionMarketSearch}
            handleCloseMarketModal={handleCloseMarket}
            playerIndex={playerIndex}
            playerLowestPrice={playerLowestPrice?.player}
          />
        </BottomSheet>

        <Toast
          visible={showToast}
          message={toastMessage}
          type={toastType}
          onHide={() => setShowToast(false)}
        />
      </SafeAreaViewContainer>
  );
};

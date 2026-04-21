import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import Market from '@/app/(tabs)/team/market';
import { View } from '@/components/Themed';
import { FormationChangeModal } from '@/components/contexts/team/FormationChangeModal';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { TeamQuickActions } from '@/components/contexts/team/TeamQuickActions';
import { TeamStatsCard } from '@/components/contexts/team/TeamStatsCard';
import type { PlayersToSell } from '@/components/contexts/team/_team.helpers';
import {
  emptyCaptain,
  emptyLineupFormation,
  emptyReservePlayers,
  fillLineupOnChangeFormation,
  onClearLineup,
  onGetDefaultLineupTeam,
  onGetEqualLineups,
  onGetFillLineupDefaultPlayers,
  onGetPlayersOnChangePositionSell,
} from '@/components/contexts/team/_team.helpers';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import type { BottomSheetRef } from '@/components/structure/BottomSheet';
import { BottomSheet } from '@/components/structure/BottomSheet';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { Toast } from '@/components/structure/Toast';
import { FORMATIONS } from '@/constants/Formations';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers, LineupPosition } from '@/models/Formations';
import { useGetMatchSubstitutions, useGetMyClub, useSaveTeam } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { onGetIsLineupComplete, onGetPayloadSaveTeam, onGetTeamPrice } from '@/utils/team';

export default () => {
  const colorTheme = useThemeColor();
  const hasInitialized = useRef(false);
  const marketSheetRef = useRef<BottomSheetRef>(null);
  const formationModalRef = useRef<BottomSheetRef>(null);
  const tabBarHeight = useBottomTabBarHeight();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, allowRequest, isMarketClose } = useMarketStatus();

  const { mutate } = useSaveTeam();

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

  // Formation change state
  const [playersToSellData, setPlayersToSellData] = useState<PlayersToSell[]>([]);
  const [selectedPlayersToRemove, setSelectedPlayersToRemove] = useState<Set<number>>(new Set());
  const [pendingFormation, setPendingFormation] = useState<string | null>(null);

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

  const isLineupComplete = useMemo(() => {
    if (!lineup || !myClub || captain === undefined) return false;
    const isEqualLineups = onGetEqualLineups(lineup, myClub);
    const isSameCaptain = myClub.capitao_id === captain;
    return (!isSameCaptain || !isEqualLineups) && onGetIsLineupComplete(lineup);
  }, [lineup, captain, myClub]);

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

  useEffect(() => {
    if (hasInitialized.current || !myClub || isRefetching) return;
    hasInitialized.current = true;

    const defaultLineup = mountLineup(myClub);
    updateLineup(defaultLineup as LineupPlayers);
    updateCaptain(myClub.capitao_id ?? 0);
    updatePrice(onGetTeamPrice(defaultLineup.starting));
    if (!formation) updateFormation(initialLineupTeamFormation);
  }, [
    myClub,
    isRefetching,
    mountLineup,
    formation,
    initialLineupTeamFormation,
    updateLineup,
    updateCaptain,
    updatePrice,
    updateFormation,
  ]);

  const onRefresh = useCallback(() => {
    // Force remount of BottomSheet to reset SafeAreaView
    setBottomSheetKey((prev) => prev + 1);

    Promise.allSettled([onRefetchPlayerStats(), onRefetchMyClub()])
      .then((results) => {
        const myClubResult = results[1];
        if (myClubResult.status !== 'fulfilled') {
          console.log('⚠️ Falha ao atualizar meu time:', myClubResult.reason);
          return;
        }

        const myTeamData = myClubResult.value.data;
        if (!myTeamData) return;

        // Restaura a formação original do time
        const originalFormation = onGetDefaultLineupTeam(myTeamData.time?.esquema_id ?? 4);
        updateFormation(originalFormation);

        const defaultLineup = mountLineup(myTeamData as FullClubInfo);
        const newPrice = onGetTeamPrice(defaultLineup.starting);

        updateLineup(defaultLineup);
        updateCaptain(myTeamData?.capitao_id as number);
        updatePrice(newPrice);
      })
      .catch((err) => {
        // Garantia extra: nunca deixar rejeição "vazar" e derrubar a screen
        console.log('⚠️ Falha inesperada no refresh:', err);
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

    // Restaura a formação original do time
    const originalFormation = initialLineupTeamFormation;
    updateFormation(originalFormation);

    // Limpa todos os jogadores com a formação original
    const lineupWithoutPlayers: LineupPlayers = onClearLineup(FORMATIONS[originalFormation]);

    // Recalculate price for empty lineup (should be 0)
    const newPrice = onGetTeamPrice(lineupWithoutPlayers.starting);

    updateLineup(lineupWithoutPlayers);
    updateCaptain(0);
    updatePrice(newPrice);
  }, [
    lineup,
    initialLineupTeamFormation,
    updateFormation,
    updateLineup,
    updateCaptain,
    updatePrice,
  ]);

  const handleFormationChange = useCallback(
    (formationIndex: number) => {
      const newFormation = onGetDefaultLineupTeam(formationIndex);

      if (!lineup) return;

      const isExistsPlayerOnLineup = lineup.starting.some((item) => item.player);
      if (!isExistsPlayerOnLineup) {
        updateFormation(newFormation);
        const lineupUpdated: LineupPlayers = onClearLineup(FORMATIONS[newFormation]);
        updateLineup(lineupUpdated);
        return;
      }

      const playersToSell = onGetPlayersOnChangePositionSell(lineup as LineupPlayers, newFormation);

      // Se houver jogadores que não cabem na nova formação, mostra o modal
      if (playersToSell.length > 0) {
        setPlayersToSellData(playersToSell);
        setPendingFormation(newFormation);
        setSelectedPlayersToRemove(new Set());
        formationModalRef.current?.snapToIndex(0);
        return;
      }

      // Se não houver conflitos, aplica a formação diretamente
      updateFormation(newFormation);
      const lineupUpdated = fillLineupOnChangeFormation(
        lineup,
        newFormation,
        playerStats,
        isMarketClose
      );
      updateLineup(lineupUpdated);

      const newPrice = onGetTeamPrice(lineupUpdated.starting);
      updatePrice(newPrice);
    },
    [lineup, playerStats, isMarketClose, updateFormation, updateLineup, updatePrice]
  );

  const handleTogglePlayerToRemove = useCallback((atletaId: number) => {
    setSelectedPlayersToRemove((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(atletaId)) {
        newSet.delete(atletaId);
      } else {
        newSet.add(atletaId);
      }
      return newSet;
    });
  }, []);

  const handleConfirmFormationChange = useCallback(() => {
    if (!pendingFormation || !lineup) return;

    // Verifica se a quantidade correta de jogadores foi selecionada
    const totalToRemove = playersToSellData.reduce((sum, pos) => sum + pos.quantityToSell, 0);
    if (selectedPlayersToRemove.size !== totalToRemove) {
      setToastMessage(`Você deve selecionar exatamente ${totalToRemove} jogador(es) para remover`);
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Remove os jogadores selecionados
    const updatedStarting = lineup.starting.map((position) => {
      if (position.player && selectedPlayersToRemove.has(position.player.atleta_id)) {
        return { ...position, player: undefined };
      }
      return position;
    });

    const updatedLineup: LineupPlayers = {
      starting: updatedStarting,
      reserves: lineup.reserves,
    };

    // Aplica a nova formação
    updateFormation(pendingFormation);
    const lineupWithNewFormation = fillLineupOnChangeFormation(
      updatedLineup,
      pendingFormation,
      playerStats,
      isMarketClose
    );
    updateLineup(lineupWithNewFormation);

    // Recalcula o preço
    const newPrice = onGetTeamPrice(lineupWithNewFormation.starting);
    updatePrice(newPrice);

    // Limpa os estados (o componente fecha automaticamente)
    setPlayersToSellData([]);
    setPendingFormation(null);
    setSelectedPlayersToRemove(new Set());

    setToastMessage('Formação alterada com sucesso!');
    setToastType('success');
    setShowToast(true);
  }, [
    pendingFormation,
    lineup,
    playersToSellData,
    selectedPlayersToRemove,
    playerStats,
    isMarketClose,
    updateFormation,
    updateLineup,
    updatePrice,
  ]);

  const handleFormationModalClose = useCallback(() => {
    setPlayersToSellData([]);
    setPendingFormation(null);
    setSelectedPlayersToRemove(new Set());
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

    const isReservesCompleted = lineup?.reserves?.every((item) => item.player);
    if (!isReservesCompleted) {
      emptyReservePlayers(() => {
        const payload = onGetPayloadSaveTeam({
          lineup: lineup as LineupPlayers,
          captain,
          formation,
        });

        mutate(payload, {
          onSuccess: () => {
            onRefetchMyClub();
            setToastMessage('Time salvo com sucesso!');
            setToastType('success');
            setShowToast(true);
          },
        });
      });
      return;
    }

    const payload = onGetPayloadSaveTeam({
      lineup: lineup as LineupPlayers,
      captain,
      formation,
    });

    mutate(payload, {
      onSuccess: () => {
        onRefetchMyClub();
        setToastMessage('Time salvo com sucesso!');
        setToastType('success');
        setShowToast(true);
      },
    });
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
    <SafeAreaViewContainer edges={['top']}>
      <ScrollView
        className="flex-1 px-2"
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefetching} />}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 16,
        }}>
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
            showSaveTeam={isLineupComplete && !isMarketClose}
            disableSaveTeam={!isLineupComplete || isMarketClose}
            onSaveTeam={handleSaveTeam}
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

      <BottomSheet key={bottomSheetKey} ref={marketSheetRef} snapPoints={['70%', '95%']}>
        <Market
          position={positionMarketSearch}
          handleCloseMarketModal={handleCloseMarket}
          playerIndex={playerIndex}
          playerLowestPrice={playerLowestPrice?.player}
        />
      </BottomSheet>

      <BottomSheet ref={formationModalRef} onClose={handleFormationModalClose}>
        <FormationChangeModal
          playersToSellData={playersToSellData}
          selectedPlayersToRemove={selectedPlayersToRemove}
          onTogglePlayer={handleTogglePlayerToRemove}
          onConfirm={handleConfirmFormationChange}
          onClose={() => formationModalRef.current?.close()}
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

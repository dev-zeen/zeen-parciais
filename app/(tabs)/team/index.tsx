import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import Market from '@/app/(tabs)/team/market';
import { FormationChangeModal } from '@/components/contexts/team/FormationChangeModal';
import { FormationSelector } from '@/components/contexts/team/FormationSelector';
import { LineupInsightsCard } from '@/components/contexts/team/LineupInsightsCard';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { PlayerSheet, PlayerSheetRef } from '@/components/contexts/team/PlayerSheet';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { TeamSaveBar, getSaveBlocker } from '@/components/contexts/team/TeamSaveBar';
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
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import type { BottomSheetRef } from '@/components/structure/BottomSheet';
import { BottomSheet } from '@/components/structure/BottomSheet';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { Toast } from '@/components/structure/Toast';
import { SegmentOption, SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateView } from '@/components/ui/StateView';
import { FORMATIONS } from '@/constants/Formations';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { useGetMatchSubstitutions, useGetMyClub, useSaveTeam } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore, { FieldStat } from '@/store/useTeamLineupStore';
import { haptics } from '@/utils/haptics';
import { onGetPayloadSaveTeam, onGetTeamPrice } from '@/utils/team';

const FIELD_STAT_OPTIONS: SegmentOption<FieldStat>[] = [
  { value: 'price', label: 'Preço' },
  { value: 'average', label: 'Média' },
  { value: 'min', label: 'Mín. val.', accessibilityLabel: 'Mínimo para valorizar' },
  { value: 'match', label: 'Confronto' },
];

export default () => {
  const hasInitialized = useRef(false);
  const marketSheetRef = useRef<BottomSheetRef>(null);
  const formationModalRef = useRef<BottomSheetRef>(null);
  const playerSheetRef = useRef<PlayerSheetRef>(null);
  const tabBarSpacing = useTabBarSpacing();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, allowRequest, isMarketClose } = useMarketStatus();

  const { mutate, isPending: isSaving } = useSaveTeam();

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    refetch: onRefetchPlayerStats,
    isRefetching: isRefetchingPlayerStats,
  } = useGetScoredPlayers(isMarketClose);

  const {
    data: myClub,
    isRefetching: isRefetchingMyClub,
    isError: isErrorMyClub,
    refetch: onRefetchMyClub,
  } = useGetMyClub(allowRequest);

  const { data: substitutions, isLoading: isInitialLoadingSubstitutions } =
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
  const fieldStat = useTeamLineupStore((state) => state.fieldStat);
  const updateFieldStat = useTeamLineupStore((state) => state.updateFieldStat);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

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

  // Motivo que impede salvar; undefined quando a escalação pode ser enviada.
  const saveBlocker = useMemo(() => {
    if (!lineup || !myClub) return undefined;
    const isEqualLineups = onGetEqualLineups(lineup, myClub);
    const isSameCaptain = myClub.capitao_id === captain;

    return getSaveBlocker({
      emptySlots: lineup.starting.filter((item) => !item.player).length,
      balance,
      hasCaptain: !!captain,
      hasChanges: !isSameCaptain || !isEqualLineups,
    });
  }, [lineup, captain, myClub, balance]);

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
        if (myClubResult.status !== 'fulfilled') return;

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

  const handlePressStarter = useCallback((player: LineupPlayer | FullPlayer) => {
    playerSheetRef.current?.open(player);
  }, []);

  const handlePressReserve = useCallback((player: LineupPlayer | FullPlayer) => {
    playerSheetRef.current?.open(player, { isReservePlayer: true });
  }, []);

  // Trocar: vende o titular e abre o mercado já filtrado na posição dele.
  const handleReplacePlayer = useCallback(
    (player: LineupPlayer | FullPlayer) => {
      const index = lineup?.starting.findIndex(
        (item) => item.player?.atleta_id === player.atleta_id
      );
      if (!lineup || index === undefined || index < 0) return;

      const slot = lineup.starting[index];
      removePlayerFromLineup(player);
      handleOpenMarket({ ...slot, player: undefined }, index);
    },
    [lineup, removePlayerFromLineup, handleOpenMarket]
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
            haptics.success();
            onRefetchMyClub();
            setToastMessage('Time salvo com sucesso!');
            setToastType('success');
            setShowToast(true);
          },
          onError: () => {
            haptics.error();
            setToastMessage('Não foi possível salvar o time. Tente de novo.');
            setToastType('error');
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
        haptics.success();
        onRefetchMyClub();
        setToastMessage('Time salvo com sucesso!');
        setToastType('success');
        setShowToast(true);
      },
      onError: () => {
        haptics.error();
        setToastMessage('Não foi possível salvar o time. Tente de novo.');
        setToastType('error');
        setShowToast(true);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captain, formation, lineup]);

  if (!isAutheticated) {
    return (
      <SafeAreaViewContainer edges={['top']}>
        <MarketStatusCard />
        <Login title="Para acessar o seu time, é necessário efetuar o login." />
      </SafeAreaViewContainer>
    );
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (isErrorMyClub && !myClub) {
    return (
      <SafeAreaViewContainer edges={['top']}>
        <StateView
          icon="wifi-off"
          title="Não foi possível carregar seu time"
          message="Verifique a conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={() => onRefetchMyClub()}
        />
      </SafeAreaViewContainer>
    );
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
        style={{ flex: 1 }}
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefetching} />}
        contentContainerStyle={{
          padding: 8,
          gap: 8,
          // Com a barra de salvar, ela já fica entre o conteúdo e a barra de abas
          paddingBottom: isMarketClose ? tabBarSpacing.contentBottom : 16,
        }}>
        <TeamStatsCard
          patrimonio={myClub?.patrimonio ?? 0}
          price={price ?? 0}
          balance={balance}
          onRefresh={onRefresh}
          onClearAll={handleClearAll}
          disabled={isMarketClose}
        />

        <FormationSelector
          formation={formation || initialLineupTeamFormation}
          disabled={isMarketClose}
          onFormationChange={handleFormationChange}
        />

        {!isMarketClose && (
          <SegmentedControl
            options={FIELD_STAT_OPTIONS}
            value={fieldStat}
            onChange={(value) => {
              haptics.selection();
              updateFieldStat(value);
            }}
          />
        )}

        <SoccerField
          lineup={lineup}
          captain={captain}
          substitutions={substitutions}
          round={marketStatus?.rodada_atual}
          isViewOnly={isMarketClose}
          fieldStat={fieldStat}
          onOpenMarket={handleOpenMarket}
          onPressPlayer={handlePressStarter}
        />

        <ListReservePlayers
          lineup={lineup}
          substitutions={substitutions}
          round={marketStatus?.rodada_atual}
          isViewOnly={isMarketClose}
          fieldStat={fieldStat}
          onOpenMarket={handleOpenMarket}
          onPressPlayer={handlePressReserve}
        />

        {!isMarketClose && (
          <LineupInsightsCard lineup={lineup} captain={captain} onReplace={handleReplacePlayer} />
        )}
      </ScrollView>

      {!isMarketClose && (
        <TeamSaveBar
          blocker={saveBlocker}
          isSaving={isSaving}
          onSave={handleSaveTeam}
          bottomOffset={tabBarSpacing.contentBottom}
        />
      )}

      <PlayerSheet
        ref={playerSheetRef}
        isViewOnly={isMarketClose}
        onReplace={isMarketClose ? undefined : handleReplacePlayer}
      />

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

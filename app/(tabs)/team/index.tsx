import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import Market from '@/app/(tabs)/team/market';
import { FormationChangeModal } from '@/components/contexts/team/FormationChangeModal';
import { FormationSelector } from '@/components/contexts/team/FormationSelector';
import { LineupInsightsCard } from '@/components/contexts/team/LineupInsightsCard';
import { ShareLineupCard } from '@/components/contexts/team/ShareLineupCard';
import { ListReservePlayers } from '@/components/contexts/team/ListReservePlayers';
import { PlayerSheet, PlayerSheetRef } from '@/components/contexts/team/PlayerSheet';
import { SoccerField } from '@/components/contexts/team/SoccerField';
import { TeamSaveBar, getSaveBlocker } from '@/components/contexts/team/TeamSaveBar';
import { TeamStatsCard } from '@/components/contexts/team/TeamStatsCard';
import { useFormationChange } from '@/components/contexts/team/useFormationChange';
import { useMarketSheet } from '@/components/contexts/team/useMarketSheet';
import {
  emptyCaptain,
  emptyLineupFormation,
  emptyLuxuryReserve,
  emptyReservePlayers,
  onClearLineup,
  onGetDefaultLineupTeam,
  onGetEqualLineups,
  onGetFillLineupDefaultPlayers,
} from '@/components/contexts/team/_team.helpers';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
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
import { LineupPlayer, LineupPlayers } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { useGetMatchSubstitutions, useGetMyClub, useSaveTeam } from '@/queries/club.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore, { FieldStat } from '@/store/useTeamLineupStore';
import { debugLog } from '@/utils/debugLog';
import { haptics } from '@/utils/haptics';
import { getLuxuryReserve, onGetPayloadSaveTeam, onGetTeamPrice } from '@/utils/team';

const FIELD_STAT_OPTIONS: SegmentOption<FieldStat>[] = [
  { value: 'price', label: 'Preço' },
  { value: 'average', label: 'Média' },
  { value: 'min', label: 'Mín. val.', accessibilityLabel: 'Mínimo para valorizar' },
  { value: 'match', label: 'Confronto' },
];

export default () => {
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
  const luxuryReserve = useTeamLineupStore((state) => state.luxuryReserve);
  const updateLuxuryReserve = useTeamLineupStore((state) => state.updateLuxuryReserve);
  const updatePrice = useTeamLineupStore((state) => state.updatePrice);
  const price = useTeamLineupStore((state) => state.price);
  const updateFormation = useTeamLineupStore((state) => state.updateFormation);
  const formation = useTeamLineupStore((state) => state.formation);
  const fieldStat = useTeamLineupStore((state) => state.fieldStat);
  const updateFieldStat = useTeamLineupStore((state) => state.updateFieldStat);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback(
    (message: string, type: 'success' | 'error') => setToast({ message, type }),
    []
  );

  const market = useMarketSheet();
  const openMarket = market.open;
  const formationChange = useFormationChange({ playerStats, isMarketClose, onMessage: showToast });

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
    const isSameLuxuryReserve = (myClub.reserva_luxo_id ?? 0) === luxuryReserve;

    return getSaveBlocker({
      emptySlots: lineup.starting.filter((item) => !item.player).length,
      balance,
      hasCaptain: !!captain,
      hasChanges: !isSameCaptain || !isSameLuxuryReserve || !isEqualLineups,
    });
  }, [lineup, captain, luxuryReserve, myClub, balance]);

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
    // Monta a escalação sempre que a store estiver vazia: na primeira carga e também depois
    // de sair e entrar de novo (o logout limpa a store, mas esta tela continua montada).
    if (lineup || !myClub || isRefetching) return;

    const defaultLineup = mountLineup(myClub);
    updateLineup(defaultLineup as LineupPlayers);
    updateCaptain(myClub.capitao_id ?? 0);
    updateLuxuryReserve(myClub.reserva_luxo_id ?? 0);
    updatePrice(onGetTeamPrice(defaultLineup.starting));
    if (!formation) updateFormation(initialLineupTeamFormation);
  }, [
    lineup,
    myClub,
    isRefetching,
    mountLineup,
    formation,
    initialLineupTeamFormation,
    updateLineup,
    updateCaptain,
    updateLuxuryReserve,
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
        updateLuxuryReserve(myTeamData?.reserva_luxo_id ?? 0);
        updatePrice(newPrice);
      })
      .catch((err) => {
        // Garantia extra: nunca deixar rejeição "vazar" e derrubar a screen
        console.log('⚠️ Falha inesperada no refresh:', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMarketClose, onRefetchMyClub, onRefetchPlayerStats, playerStats]);

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
      debugLog('trocar', 'jogador', player.atleta_id, 'encontrado no índice', index);
      if (!lineup || index === undefined || index < 0) return;

      const slot = lineup.starting[index];
      removePlayerFromLineup(player);
      openMarket({ ...slot, player: undefined }, index);
    },
    [lineup, removePlayerFromLineup, openMarket]
  );

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
    updateLuxuryReserve(0);
    updatePrice(newPrice);
  }, [
    lineup,
    initialLineupTeamFormation,
    updateFormation,
    updateLineup,
    updateCaptain,
    updateLuxuryReserve,
    updatePrice,
  ]);

  const handleSaveTeam = useCallback(() => {
    if (!formation) {
      emptyLineupFormation();
      return;
    }

    if (!captain) {
      emptyCaptain();
      return;
    }

    const save = () =>
      mutate(
        onGetPayloadSaveTeam({
          lineup: lineup as LineupPlayers,
          captain,
          formation,
          luxuryReserve,
        }),
        {
          onSuccess: () => {
            haptics.success();
            onRefetchMyClub();
            showToast('Time salvo com sucesso!', 'success');
          },
          onError: () => {
            haptics.error();
            showToast('Não foi possível salvar o time. Tente de novo.', 'error');
          },
        }
      );

    // Sem reserva de luxo (havendo algum reserva no banco): confirma antes de salvar
    const confirmLuxuryReserve = () => {
      const hasReserve = !!lineup?.reserves?.some((item) => item.player);
      if (hasReserve && !getLuxuryReserve(lineup, luxuryReserve)) {
        emptyLuxuryReserve(save);
        return;
      }
      save();
    };

    // Banco incompleto: confirma antes; depois passa pela checagem do luxo
    if (!lineup?.reserves?.every((item) => item.player)) {
      emptyReservePlayers(confirmLuxuryReserve);
      return;
    }
    confirmLuxuryReserve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captain, formation, lineup, luxuryReserve]);

  if (!isAutheticated) {
    return <Login reason="Entre para escalar seu time e acompanhar as parciais." />;
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
          onFormationChange={formationChange.change}
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
          onOpenMarket={market.open}
          onPressPlayer={handlePressStarter}
        />

        <ListReservePlayers
          lineup={lineup}
          luxuryReserve={luxuryReserve}
          substitutions={substitutions}
          round={marketStatus?.rodada_atual}
          isViewOnly={isMarketClose}
          fieldStat={fieldStat}
          onOpenMarket={market.open}
          onPressPlayer={handlePressReserve}
        />

        {!isMarketClose && (
          <LineupInsightsCard lineup={lineup} captain={captain} onReplace={handleReplacePlayer} />
        )}

        <ShareLineupCard
          team={myClub}
          lineup={lineup}
          captain={captain}
          formation={formation || initialLineupTeamFormation}
          price={price ?? 0}
          round={marketStatus.rodada_atual}
          fieldStat={fieldStat}
          isMarketClose={isMarketClose}
        />
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

      <BottomSheet
        key={bottomSheetKey}
        ref={market.ref}
        snapPoints={['70%', '95%']}
        onClose={market.reset}>
        <Market
          position={market.position}
          handleCloseMarketModal={market.close}
          playerIndex={market.index}
          playerLowestPrice={market.lowestPrice?.player}
        />
      </BottomSheet>

      <BottomSheet ref={formationChange.modalRef} size="compact" onClose={formationChange.reset}>
        <FormationChangeModal
          playersToSellData={formationChange.playersToSell}
          selectedPlayersToRemove={formationChange.selected}
          onTogglePlayer={formationChange.toggle}
          onConfirm={formationChange.confirm}
          onClose={() => formationChange.modalRef.current?.close()}
        />
      </BottomSheet>

      <Toast
        visible={!!toast}
        message={toast?.message ?? ''}
        type={toast?.type ?? 'success'}
        onHide={() => setToast(null)}
      />
    </SafeAreaViewContainer>
  );
};

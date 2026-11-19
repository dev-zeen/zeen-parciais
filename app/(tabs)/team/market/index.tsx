import { Feather } from '@expo/vector-icons';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketFiltersSheet } from '@/components/contexts/market/MarketFilters';
import {
  DEFAULT_MARKET_FILTERS,
  MarketFilterState,
  applyMarketFilters,
  countActiveFilters,
  getActiveFilterChips,
  getSortedOptions,
} from '@/components/contexts/market/MarketFilters/filters.helper';
import { MarketHeader } from '@/components/contexts/market/MarketHeader';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { MarketToolbar } from '@/components/contexts/market/MarketToolbar';
import { PlayerCompare } from '@/components/contexts/market/PlayerCompare';
import { onGetEmptyPositions } from '@/components/contexts/team/_team.helpers';
import { BottomSheet, BottomSheetRef } from '@/components/structure/BottomSheet';
import { SkeletonLoader } from '@/components/structure/SkeletonLoader';
import { AppText } from '@/components/ui/AppText';
import { SearchField } from '@/components/ui/SearchField';
import { StateView } from '@/components/ui/StateView';
import useMarketStatus from '@/hooks/useMarketStatus';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import { useTokens } from '@/hooks/useTokens';
import { LineupPlayer, LineupPosition } from '@/models/Formations';
import { FullPlayer, IPositions } from '@/models/Stats';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetMostSelected, useGetPositions } from '@/queries/players.query';
import { selectionRate } from '@/utils/insights';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { debugLog } from '@/utils/debugLog';
import { haptics } from '@/utils/haptics';
import { numberToString } from '@/utils/parseTo';

type MarketProps = {
  position?: LineupPosition;
  /** Mantido no contrato; a compra sempre ocupa a primeira vaga livre da posição. */
  playerIndex?: number;
  playerLowestPrice?: LineupPlayer | FullPlayer;
  handleCloseMarketModal?: () => void;
};

/** Toques repetidos no mesmo jogador dentro deste intervalo são ignorados. */
const DOUBLE_TAP_GUARD_MS = 600;
const SKELETON_ROWS = 6;

export default ({ position, handleCloseMarketModal, playerLowestPrice }: MarketProps) => {
  const { colors, spacing, radius } = useTokens();
  const insets = useSafeAreaInsets();
  const { getInsight, gatoMestre, matches } = usePlayerInsights();

  const { allowRequest, marketStatus } = useMarketStatus();
  const { data: myClub } = useGetMyClub(allowRequest);
  const { data: mostSelected } = useGetMostSelected(allowRequest);
  const totalTeams = marketStatus?.times_escalados;
  const {
    data: market,
    isLoading: isLoadingMarket,
    isError: isErrorMarket,
    refetch: refetchMarket,
    isRefetching: isRefetchingMarket,
  } = useGetMarket();
  const { data: positions } = useGetPositions();

  const addPlayerToLineup = useTeamLineupStore((state) => state.addPlayerToLineup);
  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);
  const price = useTeamLineupStore((state) => state.price);

  const [filters, setFilters] = useState<MarketFilterState>(DEFAULT_MARKET_FILTERS);
  const filterSheetRef = useRef<BottomSheetRef>(null);
  const compareSheetRef = useRef<BottomSheetRef>(null);
  // Jogadores marcados para comparar (segurando o card); o segundo abre a comparação.
  const [compared, setCompared] = useState<FullPlayer[]>([]);
  const lastAction = useRef<{ id: number; at: number } | null>(null);

  const balance = myClub ? (myClub.patrimonio ?? 0) - price : 0;
  const reserveCeiling = playerLowestPrice?.preco_num;
  const positionName = position ? positions?.[position.position]?.nome : undefined;

  const filterContext = useMemo(
    () => ({ positionId: position?.position, reserveCeiling, balance, gatoMestre }),
    [position?.position, reserveCeiling, balance, gatoMestre]
  );

  // A lista é derivada dos filtros: sem estado duplicado nem efeitos para mantê-la.
  const players = useMemo(
    () => (market ? applyMarketFilters(market.atletas, filters, filterContext) : []),
    [market, filters, filterContext]
  );

  const countResults = useCallback(
    (draft: MarketFilterState) =>
      market ? applyMarketFilters(market.atletas, draft, filterContext).length : 0,
    [market, filterContext]
  );

  const activeFilters = countActiveFilters(filters);
  const hasNarrowing = activeFilters > 0 || filters.search.trim().length > 0;
  const emptyPositions = useMemo(() => lineup && onGetEmptyPositions(lineup), [lineup]);
  const startingIds = useMemo(
    () => new Set(lineup?.starting.map((item) => item.player?.atleta_id).filter(Boolean)),
    [lineup]
  );

  // Diagnóstico do carregamento (remover junto com os demais logs de depuração).
  useEffect(() => {
    debugLog('mercado', 'estado', {
      posicao: position?.position ?? 'todas',
      mercado: market ? `${market.atletas?.length ?? 0} atletas` : 'sem dados',
      meuTime: myClub ? 'ok' : 'sem dados',
      lista: `${players.length} jogadores`,
      erro: isErrorMarket,
    });
  }, [position?.position, market, myClub, players.length, isErrorMarket]);

  const isRepeatedTap = useCallback((player: FullPlayer) => {
    const now = Date.now();
    const last = lastAction.current;
    lastAction.current = { id: player.atleta_id, at: now };
    return !!last && last.id === player.atleta_id && now - last.at < DOUBLE_TAP_GUARD_MS;
  }, []);

  const handleCloseMarket = useCallback(
    () => (handleCloseMarketModal ? handleCloseMarketModal() : router.back()),
    [handleCloseMarketModal]
  );

  const handleBuy = useCallback(
    (player: FullPlayer) => {
      if (isRepeatedTap(player)) return;

      addPlayerToLineup({ player, index: undefined, isReservePlayer: !!playerLowestPrice });
      haptics.success();

      // Continua aberto enquanto houver vaga na posição filtrada; senão fecha.
      const updatedLineup = useTeamLineupStore.getState().lineup;
      if (!updatedLineup) return;
      if (position && onGetEmptyPositions(updatedLineup).has(position.position)) return;

      handleCloseMarket();
    },
    [isRepeatedTap, addPlayerToLineup, playerLowestPrice, position, handleCloseMarket]
  );

  const handleSell = useCallback(
    (player: FullPlayer) => {
      if (isRepeatedTap(player)) return;
      haptics.selection();
      removePlayerFromLineup(player);
    },
    [isRepeatedTap, removePlayerFromLineup]
  );

  const handleCompare = useCallback(
    (player: FullPlayer) => {
      haptics.selection();
      const next = compared.some((item) => item.atleta_id === player.atleta_id)
        ? compared.filter((item) => item.atleta_id !== player.atleta_id)
        : [...compared.slice(-1), player];
      setCompared(next);
      if (next.length === 2) compareSheetRef.current?.snapToIndex(0);
    },
    [compared]
  );

  const closeCompare = useCallback(() => {
    compareSheetRef.current?.close();
    setCompared([]);
  }, []);

  const comparedIds = useMemo(() => new Set(compared.map((item) => item.atleta_id)), [compared]);
  const listExtraData = useMemo(() => [startingIds, comparedIds], [startingIds, comparedIds]);

  const clearFilters = useCallback(() => {
    haptics.selection();
    setFilters((current) => ({ ...DEFAULT_MARKET_FILTERS, sortId: current.sortId }));
  }, []);

  const keyExtractor = useCallback((item: FullPlayer) => `${item.atleta_id}`, []);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      // Reserva segue a regra do titular mais barato da posição, sem checar saldo ou vaga.
      const hasNoSlot = !playerLowestPrice && !emptyPositions?.has(player.posicao_id);
      const hasNoBalance = !playerLowestPrice && (!myClub || player.preco_num > balance);

      return (
        <MarketPlayerCard
          player={player}
          positions={positions as IPositions}
          market={market!}
          matches={matches!}
          insight={getInsight(player)}
          selection={selectionRate(mostSelected?.get(player.atleta_id), totalTeams)}
          onPressAddPlayerToLineup={handleBuy}
          onPressRemovePlayerFromLineup={handleSell}
          isButtonDisabled={hasNoSlot || hasNoBalance}
          disabledReason={!myClub ? 'Aguarde' : hasNoSlot ? 'Sem vaga' : 'Sem saldo'}
          isSellPlayer={startingIds.has(player.atleta_id)}
          isCompared={comparedIds.has(player.atleta_id)}
          onLongPress={handleCompare}
        />
      );
    },
    [
      playerLowestPrice,
      emptyPositions,
      myClub,
      balance,
      positions,
      market,
      matches,
      getInsight,
      mostSelected,
      totalTeams,
      handleBuy,
      handleSell,
      startingIds,
      comparedIds,
      handleCompare,
    ]
  );

  const sortOptions = useMemo(() => getSortedOptions(gatoMestre), [gatoMestre]);

  const activeChips = useMemo(
    () => getActiveFilterChips(filters, (id) => market?.clubes?.[id]?.abreviacao),
    [filters, market?.clubes]
  );

  const subtitle = playerLowestPrice
    ? `Reserva${positionName ? ` · ${positionName}` : ''}`
    : positionName
      ? `${positionName} · ${emptyPositions?.has(position!.position) ? 'vaga aberta' : 'posição completa'}`
      : 'Todas as posições';

  // ---------- Estados de tela inteira ----------

  const header = (
    <MarketHeader
      subtitle={subtitle}
      balance={myClub ? balance : undefined}
      price={price}
      onClose={handleCloseMarket}
    />
  );

  if (isErrorMarket && !market) {
    return (
      <View style={styles.container}>
        {header}
        <StateView
          icon="wifi-off"
          title="Não foi possível carregar o mercado"
          message="Verifique a conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={() => refetchMarket()}
        />
      </View>
    );
  }

  if (isLoadingMarket || !market || !lineup) {
    return (
      <View style={styles.container}>
        {header}
        <View
          style={{ padding: spacing.md, gap: spacing.xs }}
          accessibilityLabel="Carregando jogadores">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <SkeletonLoader key={index} height={76} variant="card" />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {header}

      {/* Busca */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <SearchField
          value={filters.search}
          onChangeText={(search) => setFilters((current) => ({ ...current, search }))}
          placeholder="Buscar jogador"
          accessibilityLabel="Buscar jogador pelo nome"
        />
      </View>

      <MarketToolbar
        sortOptions={sortOptions}
        sortId={filters.sortId}
        activeCount={activeFilters}
        chips={activeChips}
        onOpenFilters={() => filterSheetRef.current?.snapToIndex(0)}
        onSort={(sortId) => setFilters((current) => ({ ...current, sortId }))}
        onRemoveChip={(chip) => setFilters((current) => ({ ...current, ...chip.remove }))}
        onClearAll={clearFilters}
      />

      {/* Modo reserva: limite de preço vem do titular mais barato */}
      {playerLowestPrice ? (
        <View
          style={[
            styles.banner,
            {
              marginHorizontal: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.warningContainer,
            },
          ]}>
          <Feather name="info" size={16} color={colors.warning} />
          <AppText variant="label" style={{ flex: 1 }}>
            O reserva precisa custar menos que{' '}
            <AppText variant="label" weight="bold">
              C$ {numberToString(playerLowestPrice.preco_num)}
            </AppText>
            , o titular mais barato da posição ({playerLowestPrice.apelido}).
          </AppText>
        </View>
      ) : null}

      <AppText
        variant="label"
        color="textMuted"
        style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs }}
        accessibilityLiveRegion="polite">
        {players.length === 1 ? '1 jogador' : `${players.length} jogadores`}
        {compared.length === 1
          ? ` · segure outro jogador para comparar com ${compared[0].apelido_abreviado}`
          : ' · segure um jogador para comparar'}
      </AppText>

      <FlashList
        data={players}
        extraData={listExtraData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingMarket}
            onRefresh={() => {
              refetchMarket();
            }}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: spacing.lg + (Platform.OS === 'ios' ? insets.bottom : 0),
        }}
        ListEmptyComponent={
          hasNarrowing ? (
            <StateView
              icon="search"
              title="Nenhum jogador com esses filtros"
              message="Remova algum filtro ou mude a busca para ver mais opções."
              actionLabel="Limpar filtros e busca"
              onAction={clearFilters}
            />
          ) : (
            <StateView
              icon="users"
              title="Nenhum jogador disponível"
              message={
                playerLowestPrice
                  ? 'Não há jogador mais barato que o titular nesta posição.'
                  : 'Não há jogadores prováveis para esta posição agora.'
              }
            />
          )
        }
      />

      <BottomSheet ref={compareSheetRef} onDismissed={() => setCompared([])}>
        {compared.length === 2 ? (
          <PlayerCompare
            players={[
              {
                player: compared[0],
                insight: getInsight(compared[0]),
                selection: selectionRate(mostSelected?.get(compared[0].atleta_id), totalTeams),
              },
              {
                player: compared[1],
                insight: getInsight(compared[1]),
                selection: selectionRate(mostSelected?.get(compared[1].atleta_id), totalTeams),
              },
            ]}
            clubs={market.clubes}
            onClose={closeCompare}
          />
        ) : null}
      </BottomSheet>

      <BottomSheet ref={filterSheetRef}>
        <MarketFiltersSheet
          filters={filters}
          clubs={market.clubes}
          matches={matches}
          balance={balance}
          countResults={countResults}
          onClose={() => filterSheetRef.current?.close()}
          onApply={(draft) => {
            haptics.selection();
            setFilters((current) => ({ ...draft, search: current.search }));
            filterSheetRef.current?.close();
          }}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    marginTop: 4,
  },
});

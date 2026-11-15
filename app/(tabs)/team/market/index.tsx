import { Feather } from '@expo/vector-icons';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketFiltersSheet } from '@/components/contexts/market/MarketFilters';
import {
  DEFAULT_MARKET_FILTERS,
  MarketFilterState,
  applyMarketFilters,
  countActiveFilters,
  getSortedOptions,
  statusPlayerOptions,
} from '@/components/contexts/market/MarketFilters/filters.helper';
import { MarketPlayerCard } from '@/components/contexts/market/MarketPlayerCard';
import { onGetEmptyPositions } from '@/components/contexts/team/_team.helpers';
import { BottomSheet, BottomSheetRef } from '@/components/structure/BottomSheet';
import { SkeletonLoader } from '@/components/structure/SkeletonLoader';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { SearchField } from '@/components/ui/SearchField';
import { StateView } from '@/components/ui/StateView';
import useMarketStatus from '@/hooks/useMarketStatus';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import { useTokens } from '@/hooks/useTokens';
import { LineupPlayer, LineupPosition } from '@/models/Formations';
import { FullPlayer, IPositions } from '@/models/Stats';
import { useGetMyClub } from '@/queries/club.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetPositions } from '@/queries/players.query';
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
  const { colors, spacing, radius, minTouch } = useTokens();
  const insets = useSafeAreaInsets();
  const { getInsight, gatoMestre, matches } = usePlayerInsights();

  const { allowRequest } = useMarketStatus();
  const { data: myClub } = useGetMyClub(allowRequest);
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
          onPressAddPlayerToLineup={handleBuy}
          onPressRemovePlayerFromLineup={handleSell}
          isButtonDisabled={hasNoSlot || hasNoBalance}
          disabledReason={!myClub ? 'Aguarde' : hasNoSlot ? 'Sem vaga' : 'Sem saldo'}
          isSellPlayer={startingIds.has(player.atleta_id)}
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
      handleBuy,
      handleSell,
      startingIds,
    ]
  );

  const sortOptions = useMemo(() => getSortedOptions(gatoMestre), [gatoMestre]);

  /** Filtros ativos como chips removíveis individualmente. */
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; remove: Partial<MarketFilterState> }[] = [];
    const defaultStatuses = DEFAULT_MARKET_FILTERS.statuses;
    const statusChanged =
      filters.statuses.length !== defaultStatuses.length ||
      filters.statuses.some((id) => !defaultStatuses.includes(id));

    if (statusChanged) {
      const names = statusPlayerOptions
        .filter((status) => filters.statuses.includes(status.id))
        .map((status) => status.title);
      chips.push({
        key: 'status',
        label: names.length ? names.join(', ') : 'Todos os status',
        remove: { statuses: defaultStatuses },
      });
    }
    if (filters.maxPrice !== null)
      chips.push({ key: 'price', label: `Até C$ ${filters.maxPrice}`, remove: { maxPrice: null } });
    if (filters.fitsBalance)
      chips.push({ key: 'balance', label: 'Cabe no saldo', remove: { fitsBalance: false } });
    if (filters.minAverage !== null)
      chips.push({
        key: 'average',
        label: `Média ${filters.minAverage}+`,
        remove: { minAverage: null },
      });
    if (filters.clubs.length > 0) {
      const label =
        filters.clubs.length === 1
          ? (market?.clubes?.[filters.clubs[0]]?.abreviacao ?? '1 clube')
          : `${filters.clubs.length} clubes`;
      chips.push({ key: 'clubs', label, remove: { clubs: [] } });
    }
    return chips;
  }, [filters, market?.clubes]);

  const subtitle = playerLowestPrice
    ? `Reserva${positionName ? ` · ${positionName}` : ''}`
    : positionName
      ? `${positionName} · ${emptyPositions?.has(position!.position) ? 'vaga aberta' : 'posição completa'}`
      : 'Todas as posições';

  // ---------- Estados de tela inteira ----------

  const header = (
    <View style={[styles.header, { paddingHorizontal: spacing.md, gap: spacing.sm }]}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading" weight="bold" accessibilityRole="header">
            Mercado
          </AppText>
          <AppText variant="label" color="textMuted" numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
        <Pressable
          onPress={handleCloseMarket}
          accessibilityRole="button"
          accessibilityLabel="Fechar mercado"
          style={({ pressed }) => [
            styles.iconButton,
            {
              width: minTouch,
              height: minTouch,
              borderRadius: minTouch / 2,
              backgroundColor: colors.surfaceAlt,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View
        accessible
        accessibilityLabel={
          myClub
            ? `Saldo C$ ${numberToString(balance)}, valor do time C$ ${numberToString(price)}`
            : 'Carregando saldo'
        }
        style={styles.budget}>
        <AppText variant="label" color="textMuted">
          Saldo
        </AppText>
        <AppText
          variant="heading"
          weight="bold"
          color={!myClub ? 'textMuted' : balance < 0 ? 'negative' : 'positive'}>
          {myClub ? `C$ ${numberToString(balance)}` : '—'}
        </AppText>
        <AppText variant="label" color="textMuted" style={{ marginLeft: 'auto' }}>
          Time C$ {numberToString(price)}
        </AppText>
      </View>
    </View>
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

      {/* Filtros e ordenação */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.toolbar}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
        <Pressable
          onPress={() => filterSheetRef.current?.snapToIndex(0)}
          accessibilityRole="button"
          accessibilityLabel={activeFilters ? `Filtros, ${activeFilters} ativos` : 'Filtros'}
          style={({ pressed }) => [
            styles.filterButton,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: activeFilters ? colors.accentContainer : colors.surfaceAlt,
              borderColor: activeFilters ? colors.accentFill : 'transparent',
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Feather name="sliders" size={16} color={activeFilters ? colors.accent : colors.text} />
          <AppText variant="body" weight="bold" color={activeFilters ? 'accent' : 'text'}>
            Filtros
          </AppText>
          {activeFilters ? (
            <View style={[styles.count, { backgroundColor: colors.accentFill }]}>
              <AppText variant="caption" weight="bold" color="onAccentFill">
                {activeFilters}
              </AppText>
            </View>
          ) : null}
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {sortOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.title}
            selected={filters.sortId === option.id}
            accessibilityLabel={`Ordenar por ${option.title}`}
            onPress={() => {
              haptics.selection();
              setFilters((current) => ({ ...current, sortId: option.id }));
            }}
          />
        ))}
      </ScrollView>

      {/* Filtros ativos, removíveis um a um */}
      {activeChips.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
          {activeChips.map((chip) => (
            <Pressable
              key={chip.key}
              onPress={() => {
                haptics.selection();
                setFilters((current) => ({ ...current, ...chip.remove }));
              }}
              accessibilityRole="button"
              accessibilityLabel={`Remover filtro ${chip.label}`}
              hitSlop={{ top: 6, bottom: 6 }}
              style={({ pressed }) => [
                styles.activeChip,
                {
                  borderRadius: radius.full,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <AppText variant="label" weight="medium" numberOfLines={1}>
                {chip.label}
              </AppText>
              <Feather name="x" size={14} color={colors.textMuted} />
            </Pressable>
          ))}
          <Pressable onPress={clearFilters} accessibilityRole="button" hitSlop={10}>
            <AppText variant="label" weight="bold" color="accent" style={{ paddingVertical: 6 }}>
              Limpar tudo
            </AppText>
          </Pressable>
        </ScrollView>
      ) : null}

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
      </AppText>

      <FlashList
        data={players}
        extraData={startingIds}
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
  header: {
    paddingTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  budget: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  toolbar: {
    flexGrow: 0,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  count: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    marginTop: 4,
  },
});

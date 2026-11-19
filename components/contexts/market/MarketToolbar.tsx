import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  ActiveFilterChip,
  SortOption,
} from '@/components/contexts/market/MarketFilters/filters.helper';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { useTokens } from '@/hooks/useTokens';
import { haptics } from '@/utils/haptics';

type MarketToolbarProps = {
  sortOptions: SortOption[];
  sortId: number;
  /** Quantos filtros da folha estão diferentes do padrão */
  activeCount: number;
  chips: ActiveFilterChip[];
  onOpenFilters: () => void;
  onSort: (sortId: number) => void;
  onRemoveChip: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
};

/** Botão de filtros, ordenação em chips e filtros ativos removíveis um a um. */
export function MarketToolbar({
  sortOptions,
  sortId,
  activeCount,
  chips,
  onOpenFilters,
  onSort,
  onRemoveChip,
  onClearAll,
}: MarketToolbarProps) {
  const { colors, spacing, radius, minTouch } = useTokens();

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.toolbar}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
        <Pressable
          onPress={onOpenFilters}
          accessibilityRole="button"
          accessibilityLabel={activeCount ? `Filtros, ${activeCount} ativos` : 'Filtros'}
          style={({ pressed }) => [
            styles.filterButton,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: activeCount ? colors.accentContainer : colors.surfaceAlt,
              borderColor: activeCount ? colors.accentFill : 'transparent',
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Feather name="sliders" size={16} color={activeCount ? colors.accent : colors.text} />
          <AppText variant="body" weight="bold" color={activeCount ? 'accent' : 'text'}>
            Filtros
          </AppText>
          {activeCount ? (
            <View style={[styles.count, { backgroundColor: colors.accentFill }]}>
              <AppText variant="caption" weight="bold" color="onAccentFill">
                {activeCount}
              </AppText>
            </View>
          ) : null}
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {sortOptions.map((option) => (
          <Chip
            key={option.id}
            label={option.title}
            selected={sortId === option.id}
            accessibilityLabel={`Ordenar por ${option.title}`}
            onPress={() => {
              haptics.selection();
              onSort(option.id);
            }}
          />
        ))}
      </ScrollView>

      {chips.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
          {chips.map((chip) => (
            <Pressable
              key={chip.key}
              onPress={() => {
                haptics.selection();
                onRemoveChip(chip);
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
          <Pressable onPress={onClearAll} accessibilityRole="button" hitSlop={10}>
            <AppText variant="label" weight="bold" color="accent" style={{ paddingVertical: 6 }}>
              Limpar tudo
            </AppText>
          </Pressable>
        </ScrollView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
});

import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DEFAULT_MARKET_FILTERS,
  MIN_AVERAGES,
  MarketFilterState,
  PRICE_CEILINGS,
  statusPlayerOptions,
} from './filters.helper';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { useTokens } from '@/hooks/useTokens';
import { IClub } from '@/models/Club';
import { Matches } from '@/models/Matches';
import { haptics } from '@/utils/haptics';
import { numberToString } from '@/utils/parseTo';

type MarketFiltersSheetProps = {
  filters: MarketFilterState;
  clubs?: IClub;
  matches?: Matches;
  balance: number;
  /** Quantos jogadores um conjunto de filtros mostraria (para o botão de resultados) */
  countResults: (filters: MarketFilterState) => number;
  onApply: (filters: MarketFilterState) => void;
  onClose: () => void;
};

/**
 * Folha de filtros do mercado. Trabalha sobre um rascunho: nada muda na lista até
 * "Mostrar resultados"; o botão já mostra quantos jogadores o rascunho traria.
 */
export function MarketFiltersSheet({
  filters,
  clubs,
  matches,
  balance,
  countResults,
  onApply,
  onClose,
}: MarketFiltersSheetProps) {
  const { colors, spacing, radius, minTouch } = useTokens();
  const [draft, setDraft] = useState(filters);
  // No iOS o sheet vai até a borda da tela; no Android o BottomSheet já reserva a área segura.
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : 0;

  const results = useMemo(() => countResults(draft), [countResults, draft]);

  const update = (patch: Partial<MarketFilterState>) => {
    haptics.selection();
    setDraft((current) => ({ ...current, ...patch }));
  };

  const toggle = (list: number[], id: number) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  const clear = () =>
    update({
      statuses: DEFAULT_MARKET_FILTERS.statuses,
      clubs: [],
      maxPrice: null,
      fitsBalance: false,
      minAverage: null,
    });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <AppText variant="heading" weight="bold" accessibilityRole="header">
          Filtros
        </AppText>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar filtros"
          style={({ pressed }) => [
            styles.close,
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled">
        <Section title="Status">
          <View style={styles.wrap}>
            {statusPlayerOptions.map((status) => (
              <Chip
                key={status.id}
                label={status.title}
                selected={draft.statuses.includes(status.id)}
                onPress={() => update({ statuses: toggle(draft.statuses, status.id) })}
              />
            ))}
          </View>
          {draft.statuses.length === 0 ? (
            <AppText variant="label" color="textMuted">
              Nenhum status marcado: todos aparecem.
            </AppText>
          ) : null}
        </Section>

        <Section title="Preço">
          <View style={styles.wrap}>
            <Chip
              label="Qualquer"
              selected={draft.maxPrice === null}
              onPress={() => update({ maxPrice: null })}
            />
            {PRICE_CEILINGS.map((ceiling) => (
              <Chip
                key={ceiling}
                label={`Até C$ ${ceiling}`}
                selected={draft.maxPrice === ceiling}
                onPress={() => update({ maxPrice: ceiling })}
              />
            ))}
          </View>
          <View style={styles.wrap}>
            <Chip
              label={`Cabe no meu saldo (C$ ${numberToString(balance)})`}
              selected={draft.fitsBalance}
              onPress={() => update({ fitsBalance: !draft.fitsBalance })}
            />
          </View>
        </Section>

        <Section title="Média mínima">
          <View style={styles.wrap}>
            <Chip
              label="Qualquer"
              selected={draft.minAverage === null}
              onPress={() => update({ minAverage: null })}
            />
            {MIN_AVERAGES.map((average) => (
              <Chip
                key={average}
                label={`${average}+ pts`}
                selected={draft.minAverage === average}
                onPress={() => update({ minAverage: average })}
              />
            ))}
          </View>
        </Section>

        <Section
          title="Clubes"
          action={
            draft.clubs.length > 0 ? (
              <Pressable
                onPress={() => update({ clubs: [] })}
                accessibilityRole="button"
                hitSlop={12}>
                <AppText variant="body" weight="bold" color="accent">
                  Limpar ({draft.clubs.length})
                </AppText>
              </Pressable>
            ) : null
          }>
          <View style={{ gap: spacing.xs }}>
            {matches?.partidas?.map((match) => (
              <View key={match.partida_id} style={styles.matchRow}>
                {[match.clube_casa_id, match.clube_visitante_id].map((clubId, index) => {
                  const club = clubs?.[clubId] ?? matches.clubes?.[clubId];
                  const selected = draft.clubs.includes(clubId);
                  return (
                    <Pressable
                      key={clubId}
                      onPress={() => update({ clubs: toggle(draft.clubs, clubId) })}
                      accessibilityRole="button"
                      accessibilityLabel={club?.nome ?? `Clube ${clubId}`}
                      accessibilityState={{ selected }}
                      style={({ pressed }) => [
                        styles.club,
                        {
                          minHeight: minTouch,
                          borderRadius: radius.md,
                          backgroundColor: selected ? colors.accentContainer : colors.surfaceAlt,
                          borderColor: selected ? colors.accentFill : 'transparent',
                          flexDirection: index === 0 ? 'row' : 'row-reverse',
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}>
                      {club?.escudos?.['60x60'] ? (
                        <Image source={{ uri: club.escudos['60x60'] }} style={styles.shield} />
                      ) : null}
                      <AppText
                        variant="body"
                        weight={selected ? 'bold' : 'medium'}
                        color={selected ? 'accent' : 'text'}
                        numberOfLines={1}
                        style={{ flex: 1, textAlign: index === 0 ? 'left' : 'right' }}>
                        {club?.abreviacao ?? clubId}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            padding: spacing.md,
            paddingBottom: spacing.md + bottomInset,
            gap: spacing.sm,
            borderTopColor: colors.border,
            backgroundColor: colors.bg,
          },
        ]}>
        <Pressable
          onPress={clear}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.footerButton,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: colors.surfaceAlt,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <AppText variant="body" weight="bold">
            Limpar filtros
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => onApply(draft)}
          accessibilityRole="button"
          accessibilityLabel={`Mostrar ${results} jogadores`}
          style={({ pressed }) => [
            styles.footerButton,
            {
              flex: 1.4,
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: colors.accentFill,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <AppText variant="body" weight="bold" color="onAccentFill">
            {results === 0 ? 'Nenhum resultado' : `Mostrar ${results} jogadores`}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.sectionHeader}>
        <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
          {title.toUpperCase()}
        </AppText>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  close: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  club: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  shield: {
    width: 24,
    height: 24,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});

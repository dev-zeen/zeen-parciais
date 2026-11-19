import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';
import { numberToString } from '@/utils/parseTo';

type MarketHeaderProps = {
  subtitle: string;
  /** Saldo disponível; undefined enquanto o time carrega */
  balance?: number;
  price: number;
  onClose: () => void;
};

/** Topo do mercado: título, contexto da posição, fechar e saldo. */
export function MarketHeader({ subtitle, balance, price, onClose }: MarketHeaderProps) {
  const { colors, spacing, minTouch } = useTokens();
  const isLoaded = balance !== undefined;

  return (
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
          onPress={onClose}
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
          isLoaded
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
          color={!isLoaded ? 'textMuted' : balance < 0 ? 'negative' : 'positive'}>
          {isLoaded ? `C$ ${numberToString(balance)}` : '—'}
        </AppText>
        <AppText variant="label" color="textMuted" style={{ marginLeft: 'auto' }}>
          Time C$ {numberToString(price)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

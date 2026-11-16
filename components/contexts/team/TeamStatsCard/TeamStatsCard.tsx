import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { StatItem } from '@/components/ui/StatItem';
import { useTokens } from '@/hooks/useTokens';
import { numberToString } from '@/utils/parseTo';
import { appAlert } from '@/components/ui/AppAlert';

type TeamStatsCardProps = {
  patrimonio: number;
  price: number;
  balance: number;
  onRefresh?: () => void;
  onClearAll?: () => void;
  /** Mercado fechado: limpar fica indisponível */
  disabled?: boolean;
};

export function TeamStatsCard({
  patrimonio,
  price,
  balance,
  onRefresh,
  onClearAll,
  disabled = false,
}: TeamStatsCardProps) {
  const { colors, minTouch } = useTokens();

  const handleClearAll = () => {
    appAlert(
      'Limpar escalação',
      'Tem certeza que deseja remover todos os jogadores? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: onClearAll },
      ]
    );
  };

  const iconButton = (
    icon: keyof typeof Feather.glyphMap,
    label: string,
    onPress: () => void,
    isDisabled = false,
    color = colors.text
  ) => (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: minTouch,
          height: minTouch,
          borderRadius: minTouch / 2,
          backgroundColor: colors.surfaceAlt,
          opacity: isDisabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}>
      <Feather name={icon} size={18} color={color} />
    </Pressable>
  );

  return (
    <Card style={styles.card}>
      <View style={styles.stats}>
        <StatItem label="Patrimônio" value={numberToString(patrimonio)} />
        <StatItem label="Valor do time" value={numberToString(price)} />
        <StatItem
          label="Saldo"
          value={numberToString(balance)}
          tone={balance < 0 ? 'negative' : 'positive'}
        />
      </View>

      {onRefresh ? iconButton('refresh-cw', 'Atualizar escalação', onRefresh) : null}
      {onClearAll
        ? iconButton('trash-2', 'Limpar escalação', handleClearAll, disabled, colors.negative)
        : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useTokens } from '@/hooks/useTokens';
import { DONATION_TARGET } from '@/utils/donation';
import { numberToString } from '@/utils/parseTo';

type DonationCardProps = {
  patrimony: number;
  isReceiving: boolean;
  onReceive: () => void;
  onDismiss: () => void;
};

/** Oferta da doação de cartoletas: leva o patrimônio de volta a C$ 100, uma vez por temporada. */
export function DonationCard({ patrimony, isReceiving, onReceive, onDismiss }: DonationCardProps) {
  const { colors, spacing, radius, minTouch } = useTokens();

  return (
    <Card padding={spacing.md} style={{ gap: spacing.sm }}>
      <View style={[styles.header, { gap: spacing.xs }]}>
        <Feather name="gift" size={20} color={colors.brand} />
        <AppText variant="heading" weight="bold" accessibilityRole="header" style={{ flex: 1 }}>
          Doação dos torcedores
        </AppText>
      </View>

      <AppText variant="body">
        Seus torcedores arrecadaram cartoletas para o seu time voltar a ter C$ {DONATION_TARGET}.
        Seu patrimônio atual é de C$ {numberToString(patrimony)}.
      </AppText>
      <AppText variant="label" color="warning">
        Seu time só recebe uma doação por temporada. Use com sabedoria!
      </AppText>

      <View style={[styles.actions, { gap: spacing.xs }]}>
        <Pressable
          onPress={onDismiss}
          disabled={isReceiving}
          accessibilityRole="button"
          accessibilityHint="Esconde a oferta até a próxima rodada"
          style={({ pressed }) => [
            styles.button,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: colors.surfaceAlt,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <AppText variant="body" weight="bold">
            Não receber ainda
          </AppText>
        </Pressable>

        <Pressable
          onPress={onReceive}
          disabled={isReceiving}
          accessibilityRole="button"
          accessibilityState={{ disabled: isReceiving, busy: isReceiving }}
          style={({ pressed }) => [
            styles.button,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: colors.positiveFill,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          {isReceiving ? (
            <ActivityIndicator size="small" color={colors.onPositiveFill} />
          ) : (
            <AppText variant="body" weight="bold" color="onPositiveFill">
              Receber doação
            </AppText>
          )}
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});

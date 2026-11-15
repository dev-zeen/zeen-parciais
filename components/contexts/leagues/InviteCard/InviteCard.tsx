import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useTokens } from '@/hooks/useTokens';

type InviteCardProps = {
  title: string;
  /** Selo da modalidade (convites) */
  badge?: { label: string; tone: BadgeTone };
  subtitle?: string;
  /** Quem convidou ou quem pediu para entrar */
  from?: string;
  date?: string;
  imageUrl?: string;
  /** Imagem redonda (escudo de time) em vez de quadrada (flâmula/troféu) */
  roundImage?: boolean;
  /** Resposta em andamento: bloqueia os dois botões para evitar envio duplicado */
  pending?: 'accept' | 'decline';
  onAccept: () => void;
  onDecline: () => void;
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : format(date, "dd 'de' MMM", { locale: ptBR });
};

/** Convite recebido ou pedido de entrada, com Recusar e Aceitar sempre rotulados. */
export function InviteCard({
  title,
  badge,
  subtitle,
  from,
  date,
  imageUrl,
  roundImage,
  pending,
  onAccept,
  onDecline,
}: InviteCardProps) {
  const { colors, spacing, radius, minTouch } = useTokens();
  const when = formatDate(date);
  const busy = !!pending;

  return (
    <Card padding={spacing.md} style={{ gap: spacing.sm }}>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <Image
          source={{ uri: imageUrl }}
          resizeMode="contain"
          style={[
            styles.image,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: roundImage ? 24 : radius.sm,
            },
          ]}
        />
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="title" weight="bold" numberOfLines={2}>
            {title}
          </AppText>
          {badge || subtitle ? (
            <View style={[styles.row, { gap: 6, flexWrap: 'wrap' }]}>
              {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
              {subtitle ? (
                <AppText variant="label" color="textMuted" numberOfLines={1}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          ) : null}
          {from || when ? (
            <AppText variant="label" color="textMuted" numberOfLines={1}>
              {[from, when].filter(Boolean).join(' · ')}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={[styles.row, { gap: spacing.xs }]}>
        <Pressable
          onPress={onDecline}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Recusar ${title}`}
          accessibilityState={{ disabled: busy, busy: pending === 'decline' }}
          android_ripple={{ color: colors.border }}
          style={({ pressed }) => [
            styles.button,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: colors.surfaceAlt,
              opacity: busy && pending !== 'decline' ? 0.5 : pressed ? 0.75 : 1,
            },
          ]}>
          {pending === 'decline' ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <AppText variant="body" weight="bold">
              Recusar
            </AppText>
          )}
        </Pressable>
        <Pressable
          onPress={onAccept}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Aceitar ${title}`}
          accessibilityState={{ disabled: busy, busy: pending === 'accept' }}
          android_ripple={{ color: colors.border }}
          style={({ pressed }) => [
            styles.button,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: colors.accentFill,
              opacity: busy && pending !== 'accept' ? 0.5 : pressed ? 0.8 : 1,
            },
          ]}>
          {pending === 'accept' ? (
            <ActivityIndicator size="small" color={colors.onAccentFill} />
          ) : (
            <AppText variant="body" weight="bold" color="onAccentFill">
              Aceitar
            </AppText>
          )}
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 48,
    height: 48,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

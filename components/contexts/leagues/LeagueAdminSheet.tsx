import { Feather } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet, BottomSheetRef } from '@/components/structure/BottomSheet';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { useTokens } from '@/hooks/useTokens';

export type PendingTeam = {
  id: number;
  name: string;
  owner?: string;
  shieldUrl?: string;
};

type LeagueAdminSheetProps = {
  leagueName: string;
  /** Ausente quando a liga não aceita mais convites (encerrada ou já sorteada) */
  inviteHref?: Href;
  requestsHref?: Href;
  requestsCount?: number;
  /** Times convidados que ainda não aceitaram */
  pendingTeams: PendingTeam[];
};

export type LeagueAdminSheetRef = { open: () => void };

/**
 * Área do dono da liga, fora da tela principal: convidar, responder pedidos e ver quem
 * ainda não aceitou. Só o que a API suporta (não há editar, remover nem excluir).
 */
export const LeagueAdminSheet = forwardRef<LeagueAdminSheetRef, LeagueAdminSheetProps>(
  ({ leagueName, inviteHref, requestsHref, requestsCount = 0, pendingTeams }, ref) => {
    const { colors, spacing, minTouch } = useTokens();
    const sheetRef = useRef<BottomSheetRef>(null);
    // A próxima tela só abre depois que o sheet terminou de fechar (exigência do iOS).
    const pendingHref = useRef<Href | null>(null);

    useImperativeHandle(ref, () => ({ open: () => sheetRef.current?.snapToIndex(0) }), []);

    const go = (href: Href) => {
      pendingHref.current = href;
      sheetRef.current?.close();
    };

    const onDismissed = () => {
      const href = pendingHref.current;
      pendingHref.current = null;
      if (href) router.push(href);
    };

    return (
      <BottomSheet ref={sheetRef} size="compact" onDismissed={onDismissed}>
        {/* Cabeçalho */}
        <View
          style={[
            styles.header,
            { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
          ]}>
          <View style={{ flex: 1 }}>
            <AppText variant="heading" weight="bold" accessibilityRole="header">
              Gerenciar liga
            </AppText>
            <AppText variant="label" color="textMuted" numberOfLines={1}>
              {leagueName}
            </AppText>
          </View>
          <Pressable
            onPress={() => sheetRef.current?.close()}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            style={({ pressed }) => [
              styles.center,
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
          bounces={false}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          style={{ flexGrow: 0 }}>
          {/* Ações */}
          {inviteHref ? (
            <AdminAction
              icon="user-plus"
              title="Convidar times"
              description="Busque pelo nome do time"
              onPress={() => go(inviteHref)}
            />
          ) : null}
          {requestsHref ? (
            <AdminAction
              icon="inbox"
              title="Pedidos para entrar"
              description={requestsCount ? 'Aceite ou recuse' : 'Nenhum pedido agora'}
              count={requestsCount}
              onPress={() => go(requestsHref)}
            />
          ) : null}

          {/* Convites enviados */}
          <View
            style={[
              styles.section,
              {
                marginTop: spacing.sm,
                paddingTop: spacing.md,
                paddingHorizontal: spacing.md,
                gap: spacing.xs,
                borderTopColor: colors.border,
              },
            ]}>
            <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
              CONVITES ENVIADOS{pendingTeams.length ? ` · ${pendingTeams.length}` : ''}
            </AppText>
            {pendingTeams.length === 0 ? (
              <AppText variant="body" color="textMuted">
                Nenhum convite esperando resposta.
              </AppText>
            ) : (
              pendingTeams.map((team) => (
                <View
                  key={team.id}
                  style={[styles.row, { gap: spacing.sm, minHeight: minTouch }]}
                  accessible
                  accessibilityLabel={`${team.name}, aguardando resposta`}>
                  <Image
                    source={{ uri: team.shieldUrl }}
                    style={[styles.shield, { backgroundColor: colors.surfaceAlt }]}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText variant="body" weight="medium" numberOfLines={1}>
                      {team.name}
                    </AppText>
                    {team.owner ? (
                      <AppText variant="caption" color="textMuted" numberOfLines={1}>
                        {team.owner}
                      </AppText>
                    ) : null}
                  </View>
                  <View style={styles.center}>
                    <Badge label="Aguardando" tone="warning" />
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </BottomSheet>
    );
  }
);

LeagueAdminSheet.displayName = 'LeagueAdminSheet';

function AdminAction({
  icon,
  title,
  description,
  count,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  count?: number;
  onPress: () => void;
}) {
  const { colors, spacing, minTouch } = useTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={count ? `${title}, ${count} pendentes` : title}
      accessibilityHint={description}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => [
        styles.row,
        {
          gap: spacing.sm,
          minHeight: minTouch + spacing.md,
          paddingHorizontal: spacing.md,
          backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
        },
      ]}>
      <View style={[styles.center, styles.icon, { backgroundColor: colors.accentContainer }]}>
        <Feather name={icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body" weight="bold">
          {title}
        </AppText>
        <AppText variant="label" color="textMuted">
          {description}
        </AppText>
      </View>
      {count ? (
        <View style={[styles.center, styles.count, { backgroundColor: colors.negativeFill }]}>
          <AppText variant="caption" weight="bold" color="onNegativeFill">
            {count}
          </AppText>
        </View>
      ) : null}
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
  },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  shield: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

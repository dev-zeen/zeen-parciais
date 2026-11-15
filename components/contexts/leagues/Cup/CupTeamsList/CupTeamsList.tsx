import { router } from 'expo-router';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import { League, TeamLeague } from '@/models/Leagues';

type Row = { team: TeamLeague; pending: boolean };

type CupTeamsListProps = {
  cup: League;
  myTeamId?: number;
  isRefetching: boolean;
  onRefetch: () => void;
};

/** Mata-mata antes do sorteio: vagas preenchidas, quem ainda não aceitou e o que falta. */
export function CupTeamsList({ cup, myTeamId, isRefetching, onRefetch }: CupTeamsListProps) {
  const { colors, spacing, radius } = useTokens();
  const tabBarSpacing = useTabBarSpacing();

  const confirmed = [...(cup.times ?? [])].sort((a, b) => a.time_id - b.time_id);
  const pending = (cup.convites_enviados ?? []).map((invite) => invite.time);
  const total = cup.liga.quantidade_times ?? confirmed.length;
  const filled = confirmed.length + pending.length;
  const open = Math.max(0, total - filled);
  const progress = total > 0 ? Math.min(1, confirmed.length / total) : 0;

  const rows: Row[] = [
    ...confirmed.map((team) => ({ team, pending: false })),
    ...pending.map((team) => ({ team, pending: true })),
  ];

  const header = (
    <Card padding={spacing.md} style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
      <View style={styles.between}>
        <AppText variant="label" weight="bold" color="textMuted">
          AGUARDANDO O SORTEIO
        </AppText>
        <AppText variant="label" weight="bold">
          {confirmed.length}/{total} times
        </AppText>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.surfaceAlt, borderRadius: radius.full }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: confirmed.length }}>
        <View
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            borderRadius: radius.full,
            backgroundColor: colors.brand,
          }}
        />
      </View>
      <AppText variant="body" color="textMuted">
        {open > 0
          ? `Faltam ${open} ${open === 1 ? 'vaga' : 'vagas'}${
              pending.length
                ? ` e ${pending.length} ${pending.length === 1 ? 'convite' : 'convites'} sem resposta`
                : ''
            }. O chaveamento sai quando todas as vagas forem preenchidas.`
          : pending.length
            ? `Todas as vagas têm time; ${pending.length} ainda ${
                pending.length === 1 ? 'precisa' : 'precisam'
              } aceitar o convite.`
            : 'Vagas completas. O chaveamento sai no sorteio.'}
      </AppText>
    </Card>
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => `${row.pending ? 'p' : 't'}-${row.team.time_id}`}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: tabBarSpacing.contentBottom,
      }}
      refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
      renderItem={({ item, index }) => {
        const isMine = item.team.time_id === myTeamId;
        return (
          <Pressable
            onPress={() => router.push(`/leagues/club/${item.team.time_id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.team.nome}${isMine ? ', seu time' : ''}${
              item.pending ? ', aguardando aceitar o convite' : ''
            }`}
            android_ripple={{ color: colors.border }}
            style={({ pressed }) => [
              styles.row,
              {
                gap: spacing.sm,
                padding: spacing.sm,
                borderRadius: radius.md,
                backgroundColor: isMine ? colors.accentContainer : colors.surface,
                opacity: pressed ? 0.85 : item.pending ? 0.75 : 1,
              },
            ]}>
            <AppText variant="label" weight="bold" color="textMuted" style={{ width: 22 }}>
              {index + 1}
            </AppText>
            <Image
              source={{ uri: item.team.url_escudo_png }}
              style={[styles.shield, { backgroundColor: colors.surfaceAlt }]}
            />
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="bold" numberOfLines={1}>
                {item.team.nome}
              </AppText>
              <AppText variant="caption" color="textMuted" numberOfLines={1}>
                {isMine ? 'Você' : item.team.nome_cartola}
              </AppText>
            </View>
            {item.pending ? <Badge label="Convidado" tone="warning" /> : null}
          </Pressable>
        );
      }}
      ListFooterComponent={
        open > 0 ? (
          <AppText
            variant="label"
            color="textMuted"
            align="center"
            style={{ marginTop: spacing.md }}>
            {open} {open === 1 ? 'vaga aberta' : 'vagas abertas'}
          </AppText>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shield: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

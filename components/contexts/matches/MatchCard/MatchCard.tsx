import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { useTokens } from '@/hooks/useTokens';
import { Club } from '@/models/Club';
import { Match } from '@/models/Matches';
import { FullPlayer } from '@/models/Stats';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { onGetPartialScoreTeamByMatch } from '@/utils/match';
import { numberToString } from '@/utils/parseTo';

interface MatchCardProps {
  match: Match;
  players?: FullPlayer[];
  homeClub?: Club;
  awayClub?: Club;
  isDisabled?: boolean;
}

/**
 * Card de partida. Placar no centro, clubes dos lados com a parcial somada dos jogadores
 * de cada um; status (ao vivo, encerrada, não vale pontos) no topo.
 */
export function MatchCard({
  match,
  players,
  homeClub,
  awayClub,
  isDisabled = false,
}: MatchCardProps) {
  const router = useRouter();
  const { colors, spacing, radius } = useTokens();
  const { data: playerStats } = useGetScoredPlayers();

  const hasStarted = match.status_transmissao_tr !== 'CRIADA';
  const showTeamScore = !!playerStats && hasStarted && match.valida;
  const isLive = match.status_transmissao_tr === 'EM_ANDAMENTO';

  const side = (club: Club | undefined, clubId: number, rank: number) => ({
    club,
    rank,
    partial:
      showTeamScore && playerStats && club?.id
        ? onGetPartialScoreTeamByMatch(Number(club.id), playerStats)
        : undefined,
    mine: players?.filter((player) => player.clube_id === clubId).length ?? 0,
  });

  const home = side(homeClub, match.clube_casa_id, match.clube_casa_posicao);
  const away = side(awayClub, match.clube_visitante_id, match.clube_visitante_posicao);

  const date = format(new Date(match.partida_data), "EEE, dd/MM '·' HH:mm", { locale: ptBR });
  // Sem placar oficial ainda (jogo futuro): só o "×", sem traços.
  const hasScore = match.placar_oficial_mandante != null && match.placar_oficial_visitante != null;
  const score = hasScore
    ? `${match.placar_oficial_mandante} × ${match.placar_oficial_visitante}`
    : '×';

  const onPress = () => {
    const payload = {
      ...match,
      transmissao: '',
      home: match.clube_casa_id,
      away: match.clube_visitante_id,
    };
    router.push(`/rodada/matches/${JSON.stringify(payload)}`);
  };

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole={isDisabled ? undefined : 'button'}
      accessibilityLabel={`${homeClub?.nome ?? ''} ${hasScore ? score.replace('×', 'a') : 'contra'} ${
        awayClub?.nome ?? ''
      }, ${date}${match.valida ? '' : ', não vale pontos'}`}
      accessibilityHint={isDisabled ? undefined : 'Abre os jogadores da partida'}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => [
        styles.card,
        {
          gap: spacing.sm,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          borderColor: match.valida ? 'transparent' : colors.negative,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <View style={styles.header}>
        <AppText variant="label" color="textMuted">
          {date}
        </AppText>
        <View style={styles.badges}>
          {!match.valida ? <Badge label="Não vale pontos" tone="negative" /> : null}
          {isLive ? <Badge label="Ao vivo" tone="negative" /> : null}
          {match.valida && match.status_transmissao_tr === 'ENCERRADA' ? (
            <Badge label="Encerrada" />
          ) : null}
        </View>
      </View>

      <View style={styles.row}>
        <Team {...home} align="left" />
        <View style={styles.center}>
          <AppText variant="display" weight="bold" color={hasScore ? 'text' : 'textMuted'}>
            {score}
          </AppText>
        </View>
        <Team {...away} align="right" />
      </View>

      <View style={styles.footer}>
        <Feather name="map-pin" size={12} color={colors.textMuted} />
        <AppText variant="label" color="textMuted" numberOfLines={1} style={{ flexShrink: 1 }}>
          {match.local}
        </AppText>
        {!isDisabled ? (
          <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.chevron} />
        ) : null}
      </View>
    </Pressable>
  );
}

function Team({
  club,
  rank,
  partial,
  mine,
  align,
}: {
  club?: Club;
  rank: number;
  partial?: number;
  mine: number;
  align: 'left' | 'right';
}) {
  const { colors } = useTokens();
  const alignItems = align === 'left' ? 'flex-start' : 'flex-end';

  return (
    <View style={[styles.team, { alignItems }]}>
      <View style={[styles.teamName, { flexDirection: align === 'left' ? 'row' : 'row-reverse' }]}>
        <Image
          source={{ uri: club?.escudos?.['60x60'] }}
          style={styles.shield}
          accessibilityIgnoresInvertColors
        />
        <View style={{ alignItems }}>
          <AppText variant="title" weight="bold">
            {club?.abreviacao}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {rank}º
          </AppText>
        </View>
      </View>
      {partial != null ? (
        <AppText
          variant="label"
          weight="bold"
          color={partial > 0 ? 'positive' : partial < 0 ? 'negative' : 'textMuted'}>
          {numberToString(partial)} pts
        </AppText>
      ) : null}
      {mine > 0 ? (
        <View style={[styles.mine, { backgroundColor: colors.accentContainer }]}>
          <Feather name="user" size={10} color={colors.accent} />
          <AppText variant="caption" weight="bold" color="accent">
            {mine} no seu time
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  team: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    alignItems: 'center',
    gap: 8,
  },
  shield: {
    width: 36,
    height: 36,
  },
  mine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

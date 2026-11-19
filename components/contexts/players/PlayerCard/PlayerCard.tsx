import { Feather } from '@expo/vector-icons';
import { memo, useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { SCOUTS } from '@/constants/Scouts';
import { AuthContext } from '@/contexts/Auth.context';
import { useTokens } from '@/hooks/useTokens';
import { Club } from '@/models/Club';
import { Player, Position } from '@/models/Stats';
import { numberToString } from '@/utils/parseTo';

interface PlayerCardProps {
  player: Player;
  club?: Club;
  position?: Position;
  valorization?: number;
  isPlayerOnMyLineup?: boolean;
}

const scoreFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 });

/**
 * Linha de jogador pontuado (Rodada e detalhe da partida). Hierarquia: nome e pontuação
 * em destaque; posição e clube abaixo do nome; scouts abaixo da pontuação.
 */
export const PlayerCard = memo(
  ({ player, club, position, valorization, isPlayerOnMyLineup }: PlayerCardProps) => {
    const { colors, radius, spacing } = useTokens();
    const { isAutheticated } = useContext(AuthContext);

    const scouts = Object.entries(player.scout ?? {}) as [keyof typeof SCOUTS, number][];
    const scoreTone =
      player.pontuacao > 0 ? 'positive' : player.pontuacao < 0 ? 'negative' : 'textMuted';
    const showValorization = isAutheticated && !!valorization;

    return (
      <View
        accessible
        accessibilityLabel={`${player.apelido}, ${position?.nome ?? ''}, ${club?.nome ?? ''}, ${scoreFormat.format(player.pontuacao)} pontos${
          isPlayerOnMyLineup ? ', está no seu time' : ''
        }`}
        style={[
          styles.card,
          {
            gap: spacing.sm,
            padding: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: isPlayerOnMyLineup ? colors.accentContainer : colors.surface,
          },
        ]}>
        <Image
          source={{ uri: player.foto?.replace('FORMATO', '140x140') }}
          style={[styles.photo, { backgroundColor: colors.surfaceAlt }]}
        />

        <View style={styles.info}>
          <AppText variant="body" weight="bold" numberOfLines={1}>
            {player.apelido}
          </AppText>
          <View style={styles.meta}>
            {club?.escudos?.['30x30'] ? (
              <Image source={{ uri: club.escudos['30x30'] }} style={styles.shield} />
            ) : null}
            <AppText variant="label" color="textMuted" numberOfLines={1} style={{ flexShrink: 1 }}>
              {[position?.abreviacao?.toUpperCase(), club?.abreviacao].filter(Boolean).join(' · ')}
            </AppText>
            {isPlayerOnMyLineup ? (
              <AppText variant="caption" weight="bold" color="accent">
                NO TIME
              </AppText>
            ) : null}
          </View>
        </View>

        <View style={styles.side}>
          <View style={styles.scoreRow}>
            {showValorization ? (
              <View style={styles.valorization}>
                <Feather
                  name={valorization < 0 ? 'arrow-down' : 'arrow-up'}
                  size={12}
                  color={valorization < 0 ? colors.negative : colors.positive}
                />
                <AppText
                  variant="label"
                  weight="bold"
                  color={valorization < 0 ? 'negative' : 'positive'}>
                  {numberToString(valorization)}
                </AppText>
              </View>
            ) : null}
            <AppText variant="title" weight="bold" color={scoreTone}>
              {scoreFormat.format(player.pontuacao)}
            </AppText>
          </View>

          {scouts.length > 0 ? (
            <View style={styles.scouts}>
              {scouts.map(([code, amount]) => {
                const points = SCOUTS[code]?.points ?? 0;
                return (
                  <AppText
                    key={code}
                    variant="caption"
                    weight="bold"
                    color={points < 0 ? 'negative' : points > 0 ? 'positive' : 'textMuted'}>
                    {`${amount}${code}`}
                  </AppText>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shield: {
    width: 14,
    height: 14,
  },
  side: {
    alignItems: 'flex-end',
    gap: 2,
    maxWidth: '45%',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valorization: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  scouts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    columnGap: 6,
  },
});

import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { SoccerField } from '@/components/contexts/team/SoccerField';
import { AppText } from '@/components/ui/AppText';
import { usePlayerInsights } from '@/hooks/usePlayerInsights';
import { useShareImage } from '@/hooks/useShareImage';
import { useTokens } from '@/hooks/useTokens';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers } from '@/models/Formations';
import type { FieldStat } from '@/store/useTeamLineupStore';
import { buildLineupProjection } from '@/utils/insights';
import { numberToString } from '@/utils/parseTo';

/** Tempo para o campinho fora da tela terminar de desenhar antes da captura. */
const RENDER_DELAY_MS = 400;
const noop = () => {};

type ShareLineupCardProps = {
  team: FullClubInfo;
  lineup: LineupPlayers;
  captain: number;
  formation: string;
  /** Valor da escalação (soma dos preços) */
  price: number;
  round: number;
  fieldStat: FieldStat;
  isMarketClose: boolean;
};

/**
 * Compartilha a escalação atual (a que está na tela, mesmo antes de salvar) como imagem.
 * O card da captura só é montado ao tocar, para não desenhar o campinho duas vezes.
 */
export function ShareLineupCard({
  team,
  lineup,
  captain,
  formation,
  price,
  round,
  fieldStat,
  isMarketClose,
}: ShareLineupCardProps) {
  const { colors, spacing, radius, minTouch } = useTokens();
  const { ref: shotRef, share, isSharing } = useShareImage();
  const { getInsight } = usePlayerInsights();
  const [isCapturing, setIsCapturing] = useState(false);

  const filled = lineup.starting.filter((item) => item.player).length;
  const captainName = lineup.starting.find((item) => item.player?.atleta_id === captain)?.player
    ?.apelido;
  const bench = lineup.reserves
    .map((item) => item.player?.apelido_abreviado ?? item.player?.apelido)
    .filter(Boolean);

  const projected = useMemo(
    () =>
      isMarketClose
        ? null
        : buildLineupProjection(
            lineup.starting.map((item) => item.player),
            captain,
            getInsight
          ).projected,
    [captain, getInsight, isMarketClose, lineup.starting]
  );

  // Monta o card, espera desenhar, captura e desmonta.
  useEffect(() => {
    if (!isCapturing) return;
    const timer = setTimeout(async () => {
      await share(`Escalação do ${team.time.nome}`);
      setIsCapturing(false);
    }, RENDER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isCapturing, share, team.time.nome]);

  if (filled === 0) return null;

  const busy = isCapturing || isSharing;

  return (
    <>
      <Pressable
        onPress={() => setIsCapturing(true)}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Compartilhar escalação"
        accessibilityState={{ busy }}
        style={({ pressed }) => [
          styles.button,
          {
            minHeight: minTouch,
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <Feather name="share-2" size={18} color={colors.accent} />
        <AppText variant="body" weight="bold" style={{ flex: 1 }}>
          Compartilhar escalação
        </AppText>
        {busy ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      </Pressable>

      {isCapturing ? (
        <View style={styles.offscreen} pointerEvents="none" accessibilityElementsHidden>
          <View
            ref={shotRef}
            collapsable={false}
            style={[
              styles.shot,
              { backgroundColor: colors.bg, gap: spacing.sm, padding: spacing.md },
            ]}>
            <View style={[styles.inline, { gap: spacing.sm }]}>
              <Image source={{ uri: team.time.url_escudo_png }} style={styles.shield} />
              <View style={{ flex: 1 }}>
                <AppText variant="title" weight="bold" numberOfLines={1}>
                  {team.time.nome}
                </AppText>
                <AppText variant="label" color="textMuted" numberOfLines={1}>
                  {formation} · Rodada {round}
                </AppText>
              </View>
            </View>

            <SoccerField
              lineup={lineup}
              captain={captain}
              round={round}
              fieldStat={fieldStat}
              isViewOnly
              onOpenMarket={noop}
              onPressPlayer={noop}
            />

            <View style={[styles.inline, { justifyContent: 'space-between' }]}>
              <Info label="Capitão" value={captainName ?? 'Sem capitão'} />
              <Info label="Valor" value={`C$ ${numberToString(price)}`} />
              {projected !== null ? (
                <Info label="Projeção" value={`${numberToString(projected)} pts`} />
              ) : null}
            </View>

            {bench.length ? (
              <AppText variant="label" color="textMuted">
                Banco: {bench.join(', ')}
              </AppText>
            ) : null}

            <AppText variant="caption" color="textMuted" align="center">
              Parciais FC
            </AppText>
          </View>
        </View>
      ) : null}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexShrink: 1 }}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="body" weight="bold" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offscreen: {
    position: 'absolute',
    left: -10000,
    top: 0,
  },
  shot: {
    // O campinho usa a largura da janela; o card acompanha.
    alignSelf: 'flex-start',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shield: {
    width: 48,
    height: 48,
  },
});

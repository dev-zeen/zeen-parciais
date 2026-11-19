import { Feather } from '@expo/vector-icons';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { LEAGUE_KIND, LeagueKind } from '@/components/contexts/leagues/leagueKinds';
import { AppText } from '@/components/ui/AppText';
import { useShareImage } from '@/hooks/useShareImage';
import { useTokens } from '@/hooks/useTokens';

// ============================================
// Dados da imagem (cada tela monta os seus)
// ============================================

export type ShareStatus = {
  tone: 'live' | 'open' | 'finished' | 'pending';
  label: string;
};

export type ShareTeam = {
  name: string;
  owner?: string;
  shieldUrl?: string;
};

export type ShareTableRow = ShareTeam & {
  rank: number;
  /** Um valor por coluna; o último fica em destaque */
  values: string[];
  /** Posições ganhas (+) ou perdidas (−) */
  move?: number;
  isMine?: boolean;
};

export type ShareMatch = {
  home: ShareTeam & { score?: string; isWinner?: boolean };
  away: ShareTeam & { score?: string; isWinner?: boolean };
  isMine?: boolean;
};

export type ShareLeagueData = {
  kind: LeagueKind;
  name: string;
  imageUrl?: string;
  /** Ex.: "Campeonato", "Semifinal · rodada 36" */
  context?: string;
  status: ShareStatus;
  champion?: ShareTeam;
  table?: {
    columns: { label: string; width?: number }[];
    rows: ShareTableRow[];
    /** Linha do usuário quando ele está abaixo das mostradas */
    myRow?: ShareTableRow;
  };
  matches?: ShareMatch[];
  /** Quando não há tabela nem confrontos */
  emptyMessage?: string;
  totalTeams: number;
};

export type ShareLeagueCardRef = {
  share: () => void;
};

/**
 * A imagem leva todos os times da lista da tela. O limite só protege ligas enormes:
 * acima disso a imagem passaria de ~30 mil px de altura e a captura pode faltar memória.
 */
export const SHARE_TABLE_ROWS = 100;

const DEFAULT_COLUMN = 52;
const PREFETCH_TIMEOUT_MS = 2500;
/** Espera para o card terminar de desenhar; cresce com o tamanho da lista. */
const renderDelayOf = (data: ShareLeagueData) =>
  Math.min(350 + ((data.table?.rows.length ?? 0) + (data.matches?.length ?? 0)) * 8, 1200);

const imagesOf = (data: ShareLeagueData) =>
  [
    data.imageUrl,
    data.champion?.shieldUrl,
    ...(data.table?.rows ?? []).map((row) => row.shieldUrl),
    data.table?.myRow?.shieldUrl,
    ...(data.matches ?? []).flatMap((match) => [match.home.shieldUrl, match.away.shieldUrl]),
  ].filter((url): url is string => !!url);

/**
 * Imagem para compartilhar qualquer liga (clássica, mata-mata ou pontos corridos)
 * em qualquer situação. Ao chamar `share()`: pré-carrega os escudos, monta o card
 * fora da tela, captura e desmonta.
 */
export const ShareLeagueCard = forwardRef<ShareLeagueCardRef, { data: ShareLeagueData }>(
  ({ data }, ref) => {
    const { ref: shotRef, share } = useShareImage();
    const [isMounted, setIsMounted] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        share: async () => {
          if (isMounted) return;
          const prefetch = Promise.all(imagesOf(data).map((url) => Image.prefetch(url)));
          await Promise.race([
            prefetch.catch(() => undefined),
            new Promise((resolve) => setTimeout(resolve, PREFETCH_TIMEOUT_MS)),
          ]);
          setIsMounted(true);
        },
      }),
      [data, isMounted]
    );

    useEffect(() => {
      if (!isMounted) return;
      const timer = setTimeout(async () => {
        await share(data.name);
        setIsMounted(false);
      }, renderDelayOf(data));
      return () => clearTimeout(timer);
      // Só ao montar: os dados não mudam durante a captura.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    if (!isMounted) return null;

    return (
      <View style={styles.offscreen} pointerEvents="none" accessibilityElementsHidden>
        <View ref={shotRef} collapsable={false}>
          <ShareLeagueImage data={data} />
        </View>
      </View>
    );
  }
);

// ============================================
// Layout da imagem
// ============================================

function ShareLeagueImage({ data }: { data: ShareLeagueData }) {
  const { colors, radius } = useTokens();
  const kind = LEAGUE_KIND[data.kind];
  const band = {
    classic: colors.accentContainer,
    cup: colors.infoContainer,
    points: colors.positiveContainer,
  }[data.kind];
  const kindColor = { classic: colors.accent, cup: colors.info, points: colors.positive }[
    data.kind
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderRadius: radius.lg }]}>
      {/* Cabeçalho: flâmula/taça, nome, modalidade e status */}
      <View style={[styles.band, { backgroundColor: band }]}>
        {data.imageUrl ? <Image source={{ uri: data.imageUrl }} style={styles.flag} /> : null}
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.inline}>
            <Feather name={kind.icon} size={12} color={kindColor} />
            <AppText variant="caption" weight="bold" style={{ color: kindColor }}>
              {kind.label.toUpperCase()}
            </AppText>
          </View>
          <AppText variant="heading" weight="bold" numberOfLines={2}>
            {data.name}
          </AppText>
          {data.context ? (
            <AppText variant="label" color="textMuted" numberOfLines={1}>
              {data.context}
            </AppText>
          ) : null}
        </View>
        <StatusPill status={data.status} />
      </View>

      <View style={styles.body}>
        {data.champion ? <Champion team={data.champion} /> : null}
        {data.table ? <Table table={data.table} /> : null}
        {data.matches?.length ? (
          <View style={{ gap: 8 }}>
            {data.matches.map((match, index) => (
              <MatchRow key={index} match={match} />
            ))}
          </View>
        ) : null}
        {data.emptyMessage ? (
          <AppText variant="body" color="textMuted" align="center" style={{ paddingVertical: 24 }}>
            {data.emptyMessage}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <AppText variant="caption" color="textMuted">
          {data.totalTeams} {data.totalTeams === 1 ? 'time' : 'times'} ·{' '}
          {new Date().toLocaleDateString('pt-BR')}
        </AppText>
        <AppText variant="caption" weight="bold" color="textMuted">
          Parciais FC
        </AppText>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: ShareStatus }) {
  const { colors, radius } = useTokens();
  const tone = {
    live: { bg: colors.negativeFill, fg: colors.onNegativeFill },
    open: { bg: colors.surface, fg: colors.text },
    finished: { bg: colors.positiveFill, fg: colors.onPositiveFill },
    pending: { bg: colors.surface, fg: colors.textMuted },
  }[status.tone];

  return (
    <View style={[styles.pill, { backgroundColor: tone.bg, borderRadius: radius.full }]}>
      {status.tone === 'live' ? (
        <View style={[styles.liveDot, { backgroundColor: tone.fg }]} />
      ) : null}
      <AppText variant="caption" weight="bold" style={{ color: tone.fg }}>
        {status.label}
      </AppText>
    </View>
  );
}

function Champion({ team }: { team: ShareTeam }) {
  const { colors, radius } = useTokens();
  return (
    <View
      style={[
        styles.champion,
        { backgroundColor: colors.warningContainer, borderRadius: radius.md },
      ]}>
      <Feather name="award" size={22} color={colors.warning} />
      {team.shieldUrl ? (
        <Image source={{ uri: team.shieldUrl }} style={styles.championShield} />
      ) : null}
      <View style={{ flex: 1 }}>
        <AppText variant="caption" weight="bold" color="warning">
          CAMPEÃO
        </AppText>
        <AppText variant="title" weight="bold" numberOfLines={1}>
          {team.name}
        </AppText>
        {team.owner ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {team.owner}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function Table({ table }: { table: NonNullable<ShareLeagueData['table']> }) {
  return (
    <View style={{ gap: 2 }}>
      <View style={[styles.row, { paddingVertical: 2 }]}>
        <AppText variant="caption" weight="bold" color="textMuted" style={styles.rankHead}>
          #
        </AppText>
        <AppText variant="caption" weight="bold" color="textMuted" style={{ flex: 1 }}>
          TIME
        </AppText>
        {table.columns.map((column) => (
          <AppText
            key={column.label}
            variant="caption"
            weight="bold"
            color="textMuted"
            align="right"
            style={{ width: column.width ?? DEFAULT_COLUMN }}>
            {column.label}
          </AppText>
        ))}
      </View>
      {table.rows.map((row) => (
        <TableRow key={`${row.rank}-${row.name}`} row={row} columns={table.columns} />
      ))}
      {table.myRow ? (
        <>
          <AppText variant="caption" color="textMuted" align="center">
            ···
          </AppText>
          <TableRow row={table.myRow} columns={table.columns} />
        </>
      ) : null}
    </View>
  );
}

function TableRow({
  row,
  columns,
}: {
  row: ShareTableRow;
  columns: NonNullable<ShareLeagueData['table']>['columns'];
}) {
  const { colors, radius } = useTokens();
  const medal =
    row.rank === 1
      ? { bg: colors.warningContainer, fg: 'warning' as const }
      : row.rank <= 3
        ? { bg: colors.surfaceAlt, fg: 'text' as const }
        : { bg: 'transparent', fg: 'textMuted' as const };

  return (
    <View
      style={[
        styles.row,
        {
          borderRadius: radius.sm,
          backgroundColor: row.isMine ? colors.accentContainer : colors.surface,
          borderWidth: 1,
          borderColor: row.isMine ? colors.accentFill : 'transparent',
        },
      ]}>
      <View style={[styles.rank, { backgroundColor: medal.bg }]}>
        <AppText variant="caption" weight="bold" color={medal.fg}>
          {row.rank}
        </AppText>
      </View>
      {row.shieldUrl ? (
        <Image source={{ uri: row.shieldUrl }} style={styles.shield} />
      ) : (
        <View style={[styles.shield, { backgroundColor: colors.surfaceAlt }]} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="label" weight="bold" numberOfLines={1}>
          {row.name}
        </AppText>
        {row.owner ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {row.isMine ? 'Você' : row.owner}
          </AppText>
        ) : null}
      </View>
      {row.move ? (
        <AppText variant="caption" weight="bold" color={row.move > 0 ? 'positive' : 'negative'}>
          {row.move > 0 ? '▲' : '▼'}
          {Math.abs(row.move)}
        </AppText>
      ) : null}
      {row.values.map((value, index) => (
        <AppText
          key={index}
          variant="label"
          weight={index === row.values.length - 1 ? 'bold' : 'regular'}
          color={index === row.values.length - 1 ? 'text' : 'textMuted'}
          align="right"
          numberOfLines={1}
          style={{ width: columns[index]?.width ?? DEFAULT_COLUMN }}>
          {value}
        </AppText>
      ))}
    </View>
  );
}

function MatchRow({ match }: { match: ShareMatch }) {
  const { colors, radius } = useTokens();
  return (
    <View
      style={[
        styles.match,
        {
          borderRadius: radius.md,
          backgroundColor: match.isMine ? colors.accentContainer : colors.surface,
          borderColor: match.isMine ? colors.accentFill : 'transparent',
        },
      ]}>
      <MatchSide side={match.home} />
      <MatchSide side={match.away} />
    </View>
  );
}

function MatchSide({ side }: { side: ShareMatch['home'] }) {
  const { colors } = useTokens();
  return (
    <View style={[styles.inline, { gap: 8 }]}>
      {side.shieldUrl ? (
        <Image source={{ uri: side.shieldUrl }} style={styles.shield} />
      ) : (
        <View style={[styles.shield, { backgroundColor: colors.surfaceAlt }]} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="label" weight={side.isWinner ? 'bold' : 'regular'} numberOfLines={1}>
          {side.name}
        </AppText>
      </View>
      {side.isWinner ? <Feather name="check" size={14} color={colors.positive} /> : null}
      <AppText
        variant="label"
        weight="bold"
        color={side.isWinner ? 'positive' : 'text'}
        style={{ minWidth: 56, textAlign: 'right' }}>
        {side.score ?? '-'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -10000,
    top: 0,
  },
  card: {
    width: 380,
    overflow: 'hidden',
  },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  flag: {
    width: 52,
    height: 52,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  body: {
    padding: 14,
    gap: 12,
  },
  champion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  championShield: {
    width: 40,
    height: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  rankHead: {
    width: 24,
    textAlign: 'center',
  },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  match: {
    padding: 10,
    gap: 6,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

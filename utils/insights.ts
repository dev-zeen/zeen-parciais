/**
 * Cálculos informativos sobre jogadores e escalação.
 * Funções puras, sem imports de runtime, para poderem ser testadas com os
 * dados capturados (scripts/check-insights.mjs).
 */
import type { Club } from '@/models/Club';
import type { Match, Matches } from '@/models/Matches';
import type { GatoMestreAtletas } from '@/models/Stats';

const STATUS_PROVAVEL = 7;
const CAPTAIN_MULTIPLIER = 1.5;

type InsightPlayer = {
  atleta_id: number;
  clube_id: number;
  media_num?: number | null;
  status_id?: number;
};

export type PlayerMatchInfo = {
  match: Match;
  isHome: boolean;
  opponent?: Club;
  /** Últimos resultados do time do jogador e do adversário */
  teamForm: Match['aproveitamento_mandante'];
  opponentForm: Match['aproveitamento_mandante'];
  teamRank?: number;
  opponentRank?: number;
};

export type PlayerInsight = {
  match?: PlayerMatchInfo;
  avgHome: number | null;
  avgAway: number | null;
  /** Média no mando desta rodada; null se o Gato Mestre não tiver o dado */
  avgVenue: number | null;
  /** Melhor estimativa para a rodada: média do mando ou, na falta, a média geral */
  projected: number;
  minToValorize: number | null;
  avgMinutes: number | null;
  scoutsPerGame: { code: string; value: number }[];
  hasGatoMestre: boolean;
};

export function findPlayerMatch(clubId: number, matches?: Matches): PlayerMatchInfo | undefined {
  const match = matches?.partidas?.find(
    (item) => item.clube_casa_id === clubId || item.clube_visitante_id === clubId
  );
  if (!match || !matches) return undefined;

  const isHome = match.clube_casa_id === clubId;
  const opponentId = isHome ? match.clube_visitante_id : match.clube_casa_id;

  return {
    match,
    isHome,
    opponent: matches.clubes?.[opponentId],
    teamForm: (isHome ? match.aproveitamento_mandante : match.aproveitamento_visitante) ?? [],
    opponentForm: (isHome ? match.aproveitamento_visitante : match.aproveitamento_mandante) ?? [],
    teamRank: isHome ? match.clube_casa_posicao : match.clube_visitante_posicao,
    opponentRank: isHome ? match.clube_visitante_posicao : match.clube_casa_posicao,
  };
}

export function buildPlayerInsight(
  player: InsightPlayer,
  gatoMestre?: GatoMestreAtletas,
  matches?: Matches
): PlayerInsight {
  const data = gatoMestre?.[String(player.atleta_id)];
  const match = findPlayerMatch(player.clube_id, matches);

  const avgHome = data?.media_pontos_mandante ?? null;
  const avgAway = data?.media_pontos_visitante ?? null;
  const avgVenue = match ? (match.isHome ? avgHome : avgAway) : null;

  const scoutsPerGame = Object.entries(data?.scouts?.media ?? {})
    .map(([code, value]) => ({ code, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return {
    match,
    avgHome,
    avgAway,
    avgVenue,
    projected: avgVenue ?? player.media_num ?? 0,
    minToValorize: data?.minimo_para_valorizar ?? null,
    avgMinutes: data?.media_minutos_jogados ?? null,
    scoutsPerGame,
    hasGatoMestre: !!data,
  };
}

export type LineupProjection<T extends InsightPlayer = InsightPlayer> = {
  /** Soma das projeções dos titulares, capitão com multiplicador */
  projected: number;
  home: number;
  away: number;
  /** Titulares cujo clube não joga na rodada */
  withoutMatch: number;
  /** Titulares com status diferente de Provável */
  unlikely: T[];
  filled: number;
};

export function buildLineupProjection<T extends InsightPlayer>(
  starters: (T | undefined)[],
  captainId: number,
  getInsight: (player: T) => PlayerInsight
): LineupProjection<T> {
  const result: LineupProjection<T> = {
    projected: 0,
    home: 0,
    away: 0,
    withoutMatch: 0,
    unlikely: [],
    filled: 0,
  };

  for (const player of starters) {
    if (!player) continue;
    const insight = getInsight(player);

    result.filled += 1;
    result.projected +=
      insight.projected * (player.atleta_id === captainId ? CAPTAIN_MULTIPLIER : 1);

    if (!insight.match) result.withoutMatch += 1;
    else if (insight.match.isHome) result.home += 1;
    else result.away += 1;

    if (player.status_id !== undefined && player.status_id !== STATUS_PROVAVEL) {
      result.unlikely.push(player);
    }
  }

  return result;
}

/** Porcentagem de times que escalaram o jogador (0 a 100). */
export function selectionRate(lineups?: number, totalTeams?: number): number | null {
  if (!lineups || !totalTeams || totalTeams <= 0) return null;
  return Math.min(100, (lineups / totalTeams) * 100);
}

/** "2d 4h", "4h 12min", "12min 05s"; null quando o prazo já passou. */
export function formatCountdown(remainingMs: number): string | null {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}min`;
  return `${minutes}min ${String(seconds).padStart(2, '0')}s`;
}

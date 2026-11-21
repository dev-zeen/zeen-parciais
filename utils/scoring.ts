import { SCOUTS } from '@/constants/Scouts';

export type ScoutCode = keyof typeof SCOUTS;

/** Multiplicador do capitão (vale para pontos positivos e negativos). */
export const CAPTAIN_MULTIPLIER = 1.5;

/** Grupos da tabela de pontuação, na ordem em que aparecem na tela. */
export const SCOUT_GROUPS: { title: string; icon: string; codes: ScoutCode[] }[] = [
  { title: 'Ataque', icon: 'zap', codes: ['G', 'A', 'FT', 'FD', 'FF', 'PS', 'FS'] },
  { title: 'Defesa', icon: 'shield', codes: ['SG', 'DS'] },
  { title: 'Goleiro', icon: 'target', codes: ['DP', 'DE', 'GS'] },
  { title: 'Perde pontos', icon: 'alert-triangle', codes: ['PP', 'GC', 'CV', 'CA', 'PC', 'FC', 'I'] },
];

export type ScoringEvent = { minute: number; code: ScoutCode; label: string };

/** Lances do exemplo animado: um atacante numa partida comum. */
export const SCORING_EXAMPLE: ScoringEvent[] = [
  { minute: 12, code: 'FS', label: 'Sofreu falta na intermediária' },
  { minute: 27, code: 'FD', label: 'Chutou e o goleiro defendeu' },
  { minute: 41, code: 'G', label: 'Gol!' },
  { minute: 58, code: 'CA', label: 'Levou cartão amarelo' },
  { minute: 73, code: 'A', label: 'Deu a assistência' },
  { minute: 88, code: 'FF', label: 'Finalizou para fora' },
];

/** Pontos de uma lista de lances, arredondados em 2 casas como no jogo. */
export function sumScoutPoints(codes: ScoutCode[]) {
  const total = codes.reduce((acc, code) => acc + (SCOUTS[code]?.points ?? 0), 0);
  return Math.round(total * 100) / 100;
}

/** Pontos do capitão. */
export function captainPoints(points: number) {
  return Math.round(points * CAPTAIN_MULTIPLIER * 100) / 100;
}

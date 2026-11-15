import type { Feather } from '@expo/vector-icons';

import type { BadgeTone } from '@/components/ui/Badge';
import type { StageType } from '@/models/Leagues';

/** As três modalidades do app; a API separa pontos corridos em outro endpoint. */
export type LeagueKind = 'classic' | 'cup' | 'points';

export const LEAGUE_KIND: Record<
  LeagueKind,
  { label: string; plural: string; tone: BadgeTone; icon: keyof typeof Feather.glyphMap }
> = {
  // Cada modalidade com uma cor própria: ranking (laranja da marca), confronto (azul),
  // campeonato (verde).
  classic: { label: 'Clássica', plural: 'Clássicas', tone: 'accent', icon: 'bar-chart-2' },
  cup: { label: 'Mata-mata', plural: 'Mata-mata', tone: 'info', icon: 'git-merge' },
  points: { label: 'Pontos corridos', plural: 'Pontos corridos', tone: 'positive', icon: 'grid' },
};

export const PRIVACY_LABEL: Record<string, string> = {
  A: 'Aberta',
  M: 'Moderada',
  F: 'Fechada',
};

/** Fases do mata-mata na ordem em que acontecem. */
export const CUP_STAGES: StageType[] = ['P', 'O', 'Q', 'S', 'T', 'F'];

export const CUP_STAGE_LABEL: Record<StageType, string> = {
  P: 'Primeira fase',
  O: 'Oitavas',
  Q: 'Quartas',
  S: 'Semifinal',
  T: '3º lugar',
  F: 'Final',
};

export const pluralTeams = (count: number) => `${count} ${count === 1 ? 'time' : 'times'}`;

const pointsFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Pontuação fantasy (sempre duas casas, como no Cartola). */
export const formatPoints = (value?: number | null) => pointsFormat.format(value ?? 0);

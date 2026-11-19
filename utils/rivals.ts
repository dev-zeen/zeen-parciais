/**
 * Comparação de duas escalações na mesma rodada: quem só um dos times tem
 * (os "diferenciais") e quanto os capitães pesaram. Jogadores em comum se anulam,
 * então a diferença de pontos entre os times vem toda daqui.
 */

type LineupPlayer = { atleta_id: number };

export type ScoredPlayer<T> = { player: T; points: number };

export type LineupComparison<T> = {
  common: ScoredPlayer<T>[];
  onlyMine: ScoredPlayer<T>[];
  onlyTheirs: ScoredPlayer<T>[];
  /** Bônus do capitão (metade da pontuação dele) */
  myCaptainBonus: number;
  theirCaptainBonus: number;
  myCaptain?: T;
  theirCaptain?: T;
  /** Minha vantagem (negativa = desvantagem) vinda de diferenciais e capitães */
  balance: number;
};

const CAPTAIN_BONUS = 0.5;

const byPoints = <T>(a: ScoredPlayer<T>, b: ScoredPlayer<T>) => b.points - a.points;
const sum = <T>(list: ScoredPlayer<T>[]) => list.reduce((acc, item) => acc + item.points, 0);

export function compareLineups<T extends LineupPlayer>(
  mine: T[],
  theirs: T[],
  myCaptainId: number | undefined,
  theirCaptainId: number | undefined,
  pointsOf: (player: T) => number
): LineupComparison<T> {
  const myIds = new Set(mine.map((player) => player.atleta_id));
  const theirIds = new Set(theirs.map((player) => player.atleta_id));
  const score = (player: T) => ({ player, points: pointsOf(player) });

  const common = mine
    .filter((player) => theirIds.has(player.atleta_id))
    .map(score)
    .sort(byPoints);
  const onlyMine = mine
    .filter((player) => !theirIds.has(player.atleta_id))
    .map(score)
    .sort(byPoints);
  const onlyTheirs = theirs
    .filter((player) => !myIds.has(player.atleta_id))
    .map(score)
    .sort(byPoints);

  const myCaptain = mine.find((player) => player.atleta_id === myCaptainId);
  const theirCaptain = theirs.find((player) => player.atleta_id === theirCaptainId);
  const myCaptainBonus = myCaptain ? pointsOf(myCaptain) * CAPTAIN_BONUS : 0;
  const theirCaptainBonus = theirCaptain ? pointsOf(theirCaptain) * CAPTAIN_BONUS : 0;

  return {
    common,
    onlyMine,
    onlyTheirs,
    myCaptain,
    theirCaptain,
    myCaptainBonus,
    theirCaptainBonus,
    balance: sum(onlyMine) - sum(onlyTheirs) + myCaptainBonus - theirCaptainBonus,
  };
}

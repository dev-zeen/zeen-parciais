import { ScorePlayersProps } from '@/app/(tabs)/rodada';
import { Appreciations } from '@/models/Player';
import { IPlayerStats, Player, PlayerStats } from '@/models/Stats';

export function onGetPlayersPlayed(
  playerStats: PlayerStats,
  appreciations?: Appreciations
): ScorePlayersProps[] {
  if (playerStats) {
    const allPlayers =
      playerStats &&
      Object.keys(playerStats.atletas).map((item: string) => {
        return {
          ...(playerStats.atletas as IPlayerStats)[item],
          appreciation: appreciations?.atletas[item]?.variacao_num,
        };
      });

    const playersPlayedMatch = allPlayers?.sort((a: Player, b: Player) => {
      if (a.pontuacao <= b.pontuacao) return 1;
      return -1;
    });

    return playersPlayedMatch;
  }

  return [];
}

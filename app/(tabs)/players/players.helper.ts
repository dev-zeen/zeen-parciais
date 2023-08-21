import { IPlayerStats, Player, PlayerStats } from '@/models/Stats';

export function onGetPlayersPlayedMatch(playerStats: PlayerStats): Player[] {
  const allPlayers =
    playerStats &&
    Object.keys(playerStats.atletas).map(
      (item: string) => (playerStats.atletas as IPlayerStats)[item]
    );

  const playersPlayedMatch = allPlayers?.sort((a: Player, b: Player) => {
    if (a.pontuacao <= b.pontuacao) return 1;
    return -1;
  });

  return playersPlayedMatch;
}

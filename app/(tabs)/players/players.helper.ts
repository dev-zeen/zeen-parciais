import { IPlayersStats, Player, PlayersStats } from "@/models/Stats";

export function onGetPlayersPlayedMatch(playersStats: PlayersStats): Player[] {
  const allPlayers =
    playersStats &&
    Object.keys(playersStats.atletas).map(
      (item: string) => (playersStats.atletas as IPlayersStats)[item]
    );

  const playersPlayedMatch = allPlayers.sort((a: Player, b: Player) => {
    if (a.pontuacao <= b.pontuacao) return 1;
    return -1;
  });

  return playersPlayedMatch;
}

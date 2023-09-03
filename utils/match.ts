import { Player, PlayerStats } from '@/models/Stats';

export function onGetPartialScoreTeamByMatch(teamId: number, playerStats: PlayerStats) {
  if (playerStats) {
    const playersPlayedTeam = Object.entries(playerStats?.atletas)
      .map(([key, value]) => {
        return {
          ...value,
        };
      })
      .filter((item) => item.entrou_em_campo && item.clube_id === teamId);

    const totalScoreTeam = playersPlayedTeam.reduce(
      (sum, player) => sum + (player as Player)?.pontuacao,
      0
    );

    return totalScoreTeam;
  }
}

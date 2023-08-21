import { FullClubInfo, Substitutions } from '@/models/Club';
import { FullPlayer, Player, PlayerStats } from '@/models/Stats';

type ClubsWithRoundPartial = {
  club: string;
  partial: number;
  captain: Player;
  players: (false | Player)[];
};

type Club = {
  atletas: number[];
  capitao: string;
};

export type ClubsByLeagueUtils = Record<string, Club>;

export function onGetClubsLeagueWithPartial(
  clubs: ClubsByLeagueUtils,
  stats: PlayerStats
): ClubsWithRoundPartial[] {
  const result: ClubsWithRoundPartial[] = Object.entries(clubs).map(([clubKey, item]) => {
    const players = item.atletas.map((playerId: number) => stats.atletas[playerId]).filter(Boolean);

    return {
      club: clubKey,
      partial: players.reduce((sum, player) => sum + (player as Player)?.pontuacao, 0),
      captain: stats.atletas[item.capitao],
      players,
    };
  });

  return result;
}

export function onCalculatePartialScore(
  players: FullPlayer[],
  captainId: number,
  playersPlayingNow?: PlayerStats
): number {
  const clubAtletas = players || [];
  const playerStats = playersPlayingNow?.atletas || {};

  const points = clubAtletas.reduce((acc, { atleta_id }) => {
    const playerPlayingNow = playerStats[atleta_id];

    if (playerPlayingNow) {
      return acc + playerPlayingNow.pontuacao;
    }

    return acc;
  }, 0);

  const captain = playerStats[captainId];
  const captainPoints = captain?.pontuacao || 0;
  const totalPoints = points + captainPoints * 0.5;

  return totalPoints;
}

export function onGetPlayersHaveAlreadyPlayed(players: FullPlayer[], stats: PlayerStats) {
  const count = players.reduce((acc, current) => {
    if (stats.atletas[current.atleta_id]) {
      acc += 1;
    }
    return acc;
  }, 0);

  return count;
}

export function onUpdateTeamWithSubstitutedPlayers(club: FullClubInfo, replaces?: Substitutions[]) {
  let playersUpdated = [...club.atletas];
  let reservesUpdated = [...club.reservas];

  if (replaces) {
    replaces.forEach((replace) => {
      const playerJoined = replace.entrou;
      const playerOut = replace.saiu;

      playersUpdated = playersUpdated.map((item) =>
        item.atleta_id === playerOut.atleta_id ? playerJoined : item
      );

      reservesUpdated = reservesUpdated.map((item) =>
        item.atleta_id === playerJoined.atleta_id ? playerOut : item
      );
    });
  }

  return {
    playersUpdated,
    reservesUpdated,
  };
}

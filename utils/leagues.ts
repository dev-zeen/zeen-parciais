import { ClubByLeague, League, TeamLeague } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { PlayerStats } from '@/models/Stats';
import { ClubsByLeagueUtils, onGetClubsLeagueWithPartial } from '@/utils/partials';

export const enum OrderByOptions {
  CAMPEONATO = 'campeonato',
  TURNO = 'turno',
  MES = 'mes',
  RODADA = 'rodada',
  PATRIMONIO = 'patrimonio',
  CAPITAO = 'capitao',
}

export const onGetLeagueWithPartials = (
  league: League,
  clubsByLeague: ClubsByLeagueUtils,
  playerStats: PlayerStats,
  marketStatus: MarketStatus
): ClubByLeague[] => {
  const partialsByClub =
    clubsByLeague && playerStats && onGetClubsLeagueWithPartial(clubsByLeague, playerStats);

  const isUsingCaptainScore = !league.liga.sem_capitao;

  const clubMap = partialsByClub?.reduce((map, club) => {
    map.set(String(club.club), club);
    return map;
  }, new Map());

  const clubsUpdated = league.times.map((clubLeague: TeamLeague) => {
    const clubId = String(clubLeague.time_id);
    const club = clubMap?.get(clubId);

    const { players = [], captain } = club || {};

    const clUpdated: ClubByLeague = {
      ...clubLeague,
      playersHavePlayed: players.length,
      pontos: {
        ...clubLeague.pontos,
        rodada: club
          ? club.partial + (captain && isUsingCaptainScore ? captain.pontuacao * 0.5 : 0)
          : 0,
        campeonato:
          clubLeague.pontos?.campeonato +
          (club
            ? club.partial + (captain && isUsingCaptainScore ? captain.pontuacao * 0.5 : 0)
            : 0),
        mes:
          clubLeague.pontos?.mes +
          (club
            ? club.partial + (captain && isUsingCaptainScore ? captain.pontuacao * 0.5 : 0)
            : 0),
        turno:
          marketStatus?.rodada_atual !== 20
            ? clubLeague.pontos?.turno +
              (club
                ? club.partial + (captain && isUsingCaptainScore ? captain.pontuacao * 0.5 : 0)
                : 0)
            : club.partial + (captain && isUsingCaptainScore ? captain.pontuacao * 0.5 : 0),
        patrimonio: clubLeague.patrimonio,
      },
    };

    return clUpdated;
  });

  return clubsUpdated;
};

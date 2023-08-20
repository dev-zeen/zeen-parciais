import { ClubByLeague } from "@/app/(tabs)/leagues/[id]";
import { League, TeamLeague } from "@/models/Leagues";
import { MarketStatus } from "@/models/Market";
import { PlayerStats } from "@/models/Stats";
import {
  ClubsByLeagueUtils,
  onGetClubsLeagueWithPartial,
} from "@/utils/partials";

export const enum OrderByOptions {
  CAMPEONATO = "campeonato",
  TURNO = "turno",
  MES = "mes",
  RODADA = "rodada",
  PATRIMONIO = "patrimonio",
  CAPITAO = "capitao",
}

function merge(
  left: ClubByLeague[] | TeamLeague[],
  right: ClubByLeague[] | TeamLeague[],
  compareFn: (a: ClubByLeague, b: ClubByLeague) => number
): ClubByLeague[] | TeamLeague[] {
  const result: ClubByLeague[] | TeamLeague[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compareFn(left[leftIndex], right[rightIndex]) < 0) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  // Concatenar os elementos restantes, se houver
  while (leftIndex < left.length) {
    result.push(left[leftIndex]);
    leftIndex++;
  }

  while (rightIndex < right.length) {
    result.push(right[rightIndex]);
    rightIndex++;
  }

  return result;
}

function bubbleSort(
  arr: ClubByLeague[] | TeamLeague[],
  compareFn: (a: ClubByLeague, b: ClubByLeague) => number
): ClubByLeague[] | TeamLeague[] {
  const len = arr.length;
  let swapped;

  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (compareFn(arr[i], arr[i + 1]) > 0) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
  } while (swapped);

  return arr;
}

export function mergeSort(
  arr: ClubByLeague[] | TeamLeague[],
  compareFn: (a: ClubByLeague, b: ClubByLeague) => number
): ClubByLeague[] | TeamLeague[] {
  if (arr.length <= 1) return arr;

  // Usar BubbleSort para listas pequenas (você pode ajustar o valor limite apropriado)
  if (arr.length < 10) {
    return bubbleSort([...arr], compareFn);
  }

  const middle = Math.floor(arr.length / 2);
  const left = arr.slice(0, middle);
  const right = arr.slice(middle);

  return merge(
    mergeSort(left, compareFn),
    mergeSort(right, compareFn),
    compareFn
  );
}

export const onGetLeagueWithPartials = (
  league: League,
  clubsByLeague: ClubsByLeagueUtils,
  playerStats: PlayerStats,
  marketStatus: MarketStatus
): ClubByLeague[] => {
  const partialsByClub =
    clubsByLeague &&
    playerStats &&
    onGetClubsLeagueWithPartial(
      clubsByLeague as ClubsByLeagueUtils,
      playerStats
    );

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
          ? club.partial + (captain ? captain.pontuacao * 0.5 : 0)
          : 0,
        campeonato:
          marketStatus.rodada_atual !== 20
            ? clubLeague.pontos.campeonato +
              (club
                ? club.partial + (captain ? captain.pontuacao * 0.5 : 0)
                : 0)
            : clubLeague.pontos.campeonato,
        mes:
          clubLeague.pontos.mes +
          (club ? club.partial + (captain ? captain.pontuacao * 0.5 : 0) : 0),
        turno:
          marketStatus.rodada_atual !== 20
            ? clubLeague.pontos.turno +
              (club
                ? club.partial + (captain ? captain.pontuacao * 0.5 : 0)
                : 0)
            : club.partial + (captain ? captain.pontuacao * 0.5 : 0),
      },
    };

    return clUpdated;
  });

  return clubsUpdated;
};

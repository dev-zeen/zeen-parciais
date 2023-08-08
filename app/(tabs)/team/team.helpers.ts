import { FORMATIONS, LINEUPS_DEFAULT_OBJECT } from "@/constants/Formations";
import { FullClubInfo } from "@/models/Club";
import {
  LineupPlayer,
  LineupPlayers,
  LineupPosition,
} from "@/models/Formations";
import { FullPlayer, PlayerStats } from "@/models/Stats";

type FillPlayersInLineup = {
  players: FullPlayer[];
  arrayFillTarget: LineupPosition[];
  playerStats?: PlayerStats;
  isMarketClose?: boolean;
};

export type PlayersToSell = {
  position: string;
  players: LineupPosition[];
  quantityToSell: number;
  quantityToNewFormation: number;
};

export function onGetDefaultLineupTeam(id: number): string {
  return (LINEUPS_DEFAULT_OBJECT as any)[id];
}

export function isPlayerInClub(
  player: FullPlayer | LineupPlayer,
  playersLineup: LineupPosition[]
) {
  return playersLineup.some(
    (item) => item.player?.atleta_id === player.atleta_id
  );
}

export function clearLineup(lineupPlayers: LineupPosition[]) {
  return lineupPlayers.map((item) => {
    return {
      ...item,
      player: undefined,
    };
  });
}

export function fillPlayersInLineup({
  players,
  arrayFillTarget,
  playerStats,
  isMarketClose,
}: FillPlayersInLineup) {
  if (!players || !arrayFillTarget) return;

  const usedPlayers: { [key: number]: boolean } = {};

  arrayFillTarget.forEach((itemFormation) => {
    if (!itemFormation.player) {
      const posicao_id = itemFormation.position;
      const player = players.find(
        (item) => item.posicao_id === posicao_id && !usedPlayers[item.atleta_id]
      );

      if (player) {
        usedPlayers[player.atleta_id] = true;

        const playerData =
          isMarketClose && playerStats
            ? {
                ...player,
                ...playerStats.atletas[player.atleta_id],
              }
            : player;

        itemFormation.player = playerData;
      }
    }
  });
}

function onGetPlayerPositions(players: LineupPosition[]): Array<number> {
  const positions = new Set<number>();
  players?.forEach((player) => positions?.add(player.position));
  return Array.from(positions);
}

export function onGetPlayersOnChangePositionSell(
  currentFormationWithPlayers: LineupPlayers,
  newFormation: string
): PlayersToSell[] {
  const currentPlayers =
    currentFormationWithPlayers.players as LineupPosition[];
  const newPlayers = FORMATIONS[newFormation].players;

  const currentPlayerPositions = onGetPlayerPositions(currentPlayers);
  const playersToSell: PlayersToSell[] = [];

  const currentPlayerMap: Record<string, LineupPosition[]> =
    currentPlayerPositions.reduce((map, position) => {
      (map as any)[position] = currentPlayers.filter(
        (player) => player.position === position
      );
      return map;
    }, {});

  currentPlayerPositions.forEach((position) => {
    const currentPlayersInPosition = currentPlayerMap[position];
    const newPlayersInPosition = newPlayers.filter(
      (player) => player.position === position
    );

    const currentPlayerCountInPosition = currentPlayersInPosition.length;
    const newPlayerCountInPosition = newPlayersInPosition.length;

    if (currentPlayerCountInPosition > newPlayerCountInPosition) {
      playersToSell.push({
        position: position.toString(),
        players: currentPlayersInPosition,
        quantityToSell: currentPlayerCountInPosition - newPlayerCountInPosition,
        quantityToNewFormation: newPlayerCountInPosition,
      });
    }
  });

  return playersToSell;
}

export function onClearLineup(lineupPlayers: LineupPlayers): LineupPlayers {
  const clearPlayers = (item: LineupPosition) => ({
    ...item,
    player: undefined,
  });

  const clearLineupPositions = lineupPlayers?.players?.map(clearPlayers);
  const clearFormationReserves = lineupPlayers?.reserves?.map(clearPlayers);

  return {
    ...lineupPlayers,
    players: clearLineupPositions,
    reserves: clearFormationReserves,
  };
}

export function fillLineupOnChangeTacticalFormation(
  lineupPlayers: LineupPlayers,
  tacticalFormation?: string,
  playerStats?: PlayerStats,
  isMarketClose?: boolean
): LineupPlayers {
  const newLineup: LineupPlayers = onClearLineup(
    FORMATIONS[tacticalFormation as string]
  );

  if (!lineupPlayers.players || !newLineup.players) {
    return newLineup;
  }

  lineupPlayers.players.forEach((item) => {
    if (item.player) {
      const { posicao_id, atleta_id } = item.player;
      const emptyIndex = newLineup.players.findIndex(
        (itemFormation) =>
          itemFormation.position === posicao_id && !itemFormation.player
      );

      if (emptyIndex !== -1) {
        const player =
          isMarketClose && playerStats
            ? {
                ...item.player,
                ...playerStats?.atletas[atleta_id],
              }
            : item.player;

        newLineup.players[emptyIndex].player = player;
      } else {
        // If the player's position doesn't have a slot in the new formation,
        // you might want to handle this case or log a message.
        // For now, I'll assume you want to keep the player in their original position.
        newLineup.players.push(item);
      }
    }
  });

  return newLineup;
}

export function fillLineupWithPlayers(
  club: FullClubInfo,
  lineup: string,
  playerStats: PlayerStats,
  isMarketClose: boolean
): LineupPlayers {
  const lineupUpdated: LineupPlayers = onClearLineup(FORMATIONS[lineup]);

  fillPlayersInLineup({
    players: club.atletas,
    arrayFillTarget: lineupUpdated.players,
    playerStats,
    isMarketClose,
  });

  fillPlayersInLineup({
    players: club.reservas,
    arrayFillTarget: lineupUpdated.reserves as LineupPosition[],
    playerStats,
    isMarketClose,
  });

  return lineupUpdated;
}

export function onHasPlayersEqual(
  currentPlayers: number[],
  defaultPlayers: number[]
): boolean {
  if (!currentPlayers || !defaultPlayers) {
    return false;
  }

  const sortedCurrentPlayers = currentPlayers.slice().sort();
  const sortedDefaultPlayers = defaultPlayers.slice().sort();

  return (
    JSON.stringify(sortedCurrentPlayers) ===
    JSON.stringify(sortedDefaultPlayers)
  );
}

export function onAreEqualCapitain(
  currentCapitain: number,
  defaultCapitain: number
) {
  return currentCapitain === defaultCapitain;
}
export function onCheckLineupIsCompleted(
  lineup: LineupPlayers,
  club: FullClubInfo,
  capitain: number
): boolean {
  const currentPlayersId = lineup?.players
    .map(({ player }) => player?.atleta_id)
    .filter(Boolean);

  const defaultPlayersId = club?.atletas.map(({ atleta_id }) => atleta_id);

  const hasTotalCurrentPlayers = currentPlayersId.length === 12;
  const hasCapitain = !!capitain;

  const isEqualCurrentAndDefaultLineups = onHasPlayersEqual(
    currentPlayersId as number[],
    defaultPlayersId
  );

  return (
    hasTotalCurrentPlayers && hasCapitain && !isEqualCurrentAndDefaultLineups
  );
}

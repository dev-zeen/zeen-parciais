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
  marketIsClosed?: boolean;
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
  marketIsClosed,
}: FillPlayersInLineup) {
  players?.forEach((item) => {
    const { posicao_id } = item;
    const emptyIndex = arrayFillTarget?.findIndex(
      (itemFormation) =>
        itemFormation.position === posicao_id && !itemFormation.player
    );

    if (emptyIndex !== -1) {
      const player =
        marketIsClosed && playerStats
          ? {
              ...item,
              ...playerStats?.atletas[item.atleta_id],
            }
          : item;

      arrayFillTarget[emptyIndex].player = player;
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
  const playersToSell = [] as PlayersToSell[];

  currentPlayerPositions.forEach((position) => {
    const currentPlayersInPosition = currentPlayers.filter(
      (player) => player.position === position
    );
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

export function fillLineupWithPlayersV2(
  lineupPlayers: LineupPlayers,
  tacticalFormation?: string,
  playerStats?: PlayerStats,
  marketIsClosed?: boolean
): LineupPlayers {
  const lineupUpdated: LineupPlayers = onClearLineup(
    FORMATIONS[tacticalFormation as string]
  );

  lineupPlayers.players?.forEach((item) => {
    if (item.player) {
      const emptyIndex = lineupUpdated.players?.findIndex(
        (itemFormation) =>
          itemFormation.position === item?.player?.posicao_id &&
          !itemFormation.player
      );

      if (emptyIndex !== -1) {
        const player =
          marketIsClosed && playerStats
            ? {
                ...item.player,
                ...playerStats?.atletas[item.player?.atleta_id],
              }
            : item.player;

        lineupUpdated.players[emptyIndex].player = player;
      }
    }

    return item;
  });

  return lineupUpdated;
}

export function fillLineupWithPlayers(
  club: FullClubInfo,
  lineup: string,
  playerStats: PlayerStats,
  marketIsClosed: boolean
): LineupPlayers {
  const lineupUpdated: LineupPlayers = onClearLineup(FORMATIONS[lineup]);

  fillPlayersInLineup({
    players: club.atletas,
    arrayFillTarget: lineupUpdated.players,
    playerStats,
    marketIsClosed,
  });

  fillPlayersInLineup({
    players: club.reservas,
    arrayFillTarget: lineupUpdated.reserves as LineupPosition[],
    playerStats,
    marketIsClosed,
  });

  return lineupUpdated;
}

export function onHasPlayersEqual(
  currentPlayers: number[],
  defaultPlayers: number[]
) {
  const areEqual =
    currentPlayers?.every((currentPlayerId) =>
      defaultPlayers?.includes(currentPlayerId)
    ) &&
    defaultPlayers?.every((defaultPlayerId) =>
      currentPlayers?.includes(defaultPlayerId)
    );

  return areEqual;
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
) {
  const currentPlayersId = lineup?.players
    .map(({ player }) => player?.atleta_id)
    .filter((item) => item);

  const defaultPlayersId = club?.atletas.map(({ atleta_id }) => atleta_id);

  const hasTotalCurrentPlayers = currentPlayersId.length === 12;
  const hasCapitain = !!capitain;

  const isEqualCurrentAndDefaultLineups = onHasPlayersEqual(
    currentPlayersId as Array<number>,
    defaultPlayersId as Array<number>
  );

  return (
    hasTotalCurrentPlayers && hasCapitain && !isEqualCurrentAndDefaultLineups
  );
}

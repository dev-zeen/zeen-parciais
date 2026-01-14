import { Alert } from 'react-native';

import { FORMATIONS, LINEUPS_DEFAULT_OBJECT } from '@/constants/Formations';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer, PlayerStats } from '@/models/Stats';

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

export function isPlayerInClub(player: FullPlayer | LineupPlayer, playersLineup: LineupPosition[]) {
  return playersLineup.some((item) => item.player?.atleta_id === player.atleta_id);
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
      const player = players.find((item) => {
        if (item) {
          return item?.posicao_id === posicao_id && !usedPlayers[item.atleta_id];
        }
      });

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

function onGetPlayerPositions(starting: LineupPosition[]): number[] {
  const positions = new Set<number>();
  starting?.forEach((player) => {
    if (player.player) positions?.add(player.position);
  });
  return Array.from(positions);
}

export function onGetPlayersOnChangePositionSell(
  currentFormationWithPlayers: LineupPlayers,
  newFormation: string
): PlayersToSell[] {
  const currentPlayers = currentFormationWithPlayers.starting as LineupPosition[];
  const newPlayers = FORMATIONS[newFormation].starting;

  const currentPlayerPositions = onGetPlayerPositions(currentPlayers);
  const playersToSell: PlayersToSell[] = [];

  const currentPlayerMap: Record<string, LineupPosition[]> = currentPlayerPositions.reduce(
    (map, position) => {
      (map as any)[position] = currentPlayers.filter(
        (player) => player.player && player.position === position
      );
      return map;
    },
    {}
  );

  currentPlayerPositions.forEach((position) => {
    const currentPlayersInPosition = currentPlayerMap[position];
    const newPlayersInPosition = newPlayers.filter((player) => player.position === position);

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

  const clearLineupPositions = lineupPlayers?.starting?.map(clearPlayers);
  const clearFormationReserves = lineupPlayers?.reserves?.map(clearPlayers);

  return {
    ...lineupPlayers,
    starting: clearLineupPositions,
    reserves: clearFormationReserves,
  };
}

export function fillLineupOnChangeFormation(
  lineupPlayers: LineupPlayers,
  formation?: string,
  playerStats?: PlayerStats,
  isMarketClose?: boolean
): LineupPlayers {
  const newLineup: LineupPlayers = onClearLineup(FORMATIONS[formation as string]);

  if (!lineupPlayers.starting || !newLineup.starting) {
    return newLineup;
  }

  lineupPlayers.starting.forEach((item) => {
    if (item.player) {
      const { posicao_id, atleta_id } = item.player;
      const emptyIndex = newLineup.starting.findIndex(
        (itemFormation) => itemFormation.position === posicao_id && !itemFormation.player
      );

      if (emptyIndex !== -1) {
        const player =
          isMarketClose && playerStats
            ? {
                ...item.player,
                ...playerStats?.atletas[atleta_id],
              }
            : item.player;

        newLineup.starting[emptyIndex].player = player;
      } else {
        // If the player's position doesn't have a slot in the new formation,
        // you might want to handle this case or log a message.
        // For now, I'll assume you want to keep the player in their original position.
        newLineup.starting.push(item);
      }
    }
  });

  return newLineup;
}

export function fillLineupWithPlayers({
  lineupStart,
  reserves,
  formationId,
  playerStats,
  isMarketClose,
}: {
  lineupStart: FullPlayer[];
  reserves: FullPlayer[];
  formationId?: number;
  playerStats?: PlayerStats;
  isMarketClose?: boolean;
}): LineupPlayers {
  const formation = (LINEUPS_DEFAULT_OBJECT as any)[formationId ?? 4];
  const lineupUpdated: LineupPlayers = onClearLineup(FORMATIONS[formation]);

  fillPlayersInLineup({
    players: lineupStart,
    arrayFillTarget: lineupUpdated.starting,
    playerStats,
    isMarketClose,
  });

  fillPlayersInLineup({
    players: reserves,
    arrayFillTarget: lineupUpdated.reserves as LineupPosition[],
    playerStats,
    isMarketClose,
  });

  return lineupUpdated;
}

export function isPlayersEqual(currentPlayers: number[], defaultPlayers: number[]): boolean {
  const sortedCurrentPlayers = currentPlayers?.slice().sort();
  const sortedDefaultPlayers = defaultPlayers?.slice().sort();

  return JSON.stringify(sortedCurrentPlayers) === JSON.stringify(sortedDefaultPlayers);
}

export function onGetEqualLineups(lineup: LineupPlayers, club: FullClubInfo): boolean {
  const defaultPlayersId = club?.atletas?.map(({ atleta_id }) => atleta_id) ?? [];
  const currentPlayersId = lineup.starting.map(({ player }) => player?.atleta_id);

  const isEqualLineupPlayers = isPlayersEqual(currentPlayersId as number[], defaultPlayersId);

  const defaultReservesId = club?.reservas ? club?.reservas?.map(({ atleta_id }) => atleta_id) : [];
  const currentReservesId = lineup?.reserves.map(({ player }) => player?.atleta_id).filter(Boolean);

  const isEqualLineupReserves = isPlayersEqual(
    defaultReservesId as number[],
    currentReservesId as number[]
  );

  return isEqualLineupPlayers && isEqualLineupReserves;
}

export function listDefaultLineups() {
  return Object.entries(LINEUPS_DEFAULT_OBJECT).map(([_key, value]) => value);
}

export const emptyReservePlayers = (onSuccess: () => void) =>
  Alert.alert(
    'Atenção',
    'Seu time ainda não possui todos os reservas selecionados, deseja escalar mesmo assim',
    [
      {
        text: 'Não',
        style: 'cancel',
      },
      { text: 'Sim', onPress: () => onSuccess() },
    ]
  );

export const emptyCaptain = () =>
  Alert.alert('Atenção', 'Selecione um capitão', [
    {
      text: 'Ok',
      style: 'cancel',
    },
  ]);

export const emptyLineupFormation = () =>
  Alert.alert('Atenção', 'Selecione uma formação', [
    {
      text: 'Ok',
      style: 'cancel',
    },
  ]);

export const onSuccessSavedTeam = () =>
  Alert.alert('Boa cartoleiro!', 'Time escalado com sucesso.', [{ text: 'OK' }]);

export const onGetEmptyPositions = (lineup: LineupPlayers) => {
  const emptyPositionsUpdated = new Set(
    (lineup?.starting || []).filter(({ player }) => !player).map(({ position }) => position)
  );

  return emptyPositionsUpdated;
};

export const onGetFillLineupDefaultPlayers = ({
  lineupStart,
  reserves,
  formationId,
  playerStats,
  isMarketClose,
}: {
  lineupStart: FullPlayer[];
  reserves: FullPlayer[];
  formationId?: number;
  playerStats?: PlayerStats;
  isMarketClose?: boolean;
}) => {
  const defaultLineup = fillLineupWithPlayers({
    lineupStart,
    reserves,
    formationId: formationId ?? 4,
    playerStats,
    isMarketClose,
  });

  return defaultLineup;
};

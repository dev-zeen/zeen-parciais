import { FORMATIONS, SCHEMAS_OBJECT } from "@/constants/Formations";
import { FullClubInfo } from "@/models/Club";
import { FormationPlayer, ISchema, PlayerFormation } from "@/models/Formations";
import { FullPlayer, PlayersStats } from "@/models/Stats";

type FillPlayersInSchema = {
  players: FullPlayer[];
  arrayFillTarget: FormationPlayer[];
  playersStats: PlayersStats;
  marketIsClosed: boolean;
};

export type PlayersToSell = {
  position: string;
  players: FormationPlayer[];
  quantityToSell: number;
  quantityToNewFormation: number;
};

export function onGetDefaultFormation(id: number): string {
  return (SCHEMAS_OBJECT as any)[id];
}

export function isPlayerInClub(
  player: FullPlayer | PlayerFormation,
  playersSchema: FormationPlayer[]
) {
  return playersSchema.some(
    (item) => item.player?.atleta_id === player.atleta_id
  );
}

export function clearSchema(formation: FormationPlayer[]) {
  return formation.map((item) => {
    return {
      ...item,
      player: undefined,
    };
  });
}

export function fillPlayersInSchema({
  players,
  arrayFillTarget,
  playersStats,
  marketIsClosed,
}: FillPlayersInSchema) {
  players?.forEach((item) => {
    const { posicao_id } = item;
    const emptyIndex = arrayFillTarget?.findIndex(
      (itemFormation) =>
        itemFormation.position === posicao_id && !itemFormation.player
    );

    if (emptyIndex !== -1) {
      const player =
        marketIsClosed && playersStats
          ? {
              ...item,
              ...playersStats?.atletas[item.atleta_id],
            }
          : item;

      arrayFillTarget[emptyIndex].player = player;
    }
  });
}

function onGetPlayerPositions(players: FormationPlayer[]): Array<number> {
  const positions = new Set<number>();
  players?.forEach((player) => positions?.add(player.position));
  return Array.from(positions);
}

export function onGetPlayersOnChangePositionSell(
  currentFormationWithPlayers: ISchema,
  newFormation: string
): PlayersToSell[] {
  const currentPlayers =
    currentFormationWithPlayers.players as FormationPlayer[];
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

export function onClearSchema(formation: ISchema): ISchema {
  const clearPlayers = (item: FormationPlayer) => ({
    ...item,
    player: undefined,
  });

  const clearFormationPlayers = formation?.players?.map(clearPlayers);
  const clearFormationReserves = formation?.reserves?.map(clearPlayers);

  return {
    ...formation,
    players: clearFormationPlayers,
    reserves: clearFormationReserves,
  };
}

export function fillFormationWithPlayers(
  club: FullClubInfo,
  formation: string,
  playersStats: PlayersStats,
  marketIsClosed: boolean
): ISchema {
  const updatedFormation: ISchema = onClearSchema(FORMATIONS[formation]);

  fillPlayersInSchema({
    players: club.atletas,
    arrayFillTarget: updatedFormation.players,
    playersStats,
    marketIsClosed,
  });

  fillPlayersInSchema({
    players: club.reservas,
    arrayFillTarget: updatedFormation.reserves as FormationPlayer[],
    playersStats,
    marketIsClosed,
  });

  return updatedFormation;
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

export function onCheckSchemaIsCompleted(
  schema: ISchema,
  club: FullClubInfo,
  capitain: number
) {
  const currentPlayersId = schema?.players
    .map(({ player }) => player?.atleta_id)
    .filter((item) => item);

  const defaultPlayersId = club?.atletas.map(({ atleta_id }) => atleta_id);

  const hasTotalCurrentPlayers = currentPlayersId.length === 12;
  const hasCapitain = !!capitain;

  const isEqualCurrentAndDefaultSchemas = onHasPlayersEqual(
    currentPlayersId as Array<number>,
    defaultPlayersId as Array<number>
  );

  return (
    hasTotalCurrentPlayers && hasCapitain && !isEqualCurrentAndDefaultSchemas
  );
}

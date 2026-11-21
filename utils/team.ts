import { PlayersToSell } from '@/components/contexts/team/_team.helpers';
import { LINEUPS_DEFAULT_OBJECT } from '@/constants/Formations';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';

type AddPlayerProps = {
  lineup: LineupPlayers;
  player: FullPlayer;
  index?: number;
  isReservePlayer?: boolean;
};

type SaveTeamProps = {
  lineup: LineupPlayers;
  captain: number;
  formation: string;
  /** atleta_id do reserva de luxo; 0 = nenhum */
  luxuryReserve?: number;
};

export type SaveTeamPayload = {
  atletas: (number | undefined)[];
  reservas: Record<string, number>;
  esquema: number;
  capitao: number;
  reserva_luxo_id?: number;
};

/**
 * Reserva de luxo válido: o id só vale se o jogador estiver no banco.
 * Devolve 0 quando não há luxo ou quando o jogador saiu do banco.
 */
export function getLuxuryReserve(lineup: LineupPlayers | undefined, id: number | null | undefined) {
  if (!id || !lineup) return 0;
  return lineup.reserves.some((item) => item.player?.atleta_id === id) ? id : 0;
}

export function onRemovePlayerFromLineup(lineup: LineupPlayers, player: LineupPlayer | FullPlayer) {
  const { starting, reserves } = lineup;
  const { atleta_id: playerId, posicao_id: playerPositionId } = player;

  function onRemovePlayer(lineupPlayers: LineupPosition[], playerId: number) {
    return lineupPlayers.map((item) =>
      item.player?.atleta_id === playerId ? { ...item, player: undefined } : item
    );
  }

  const updatedStarting = onRemovePlayer(starting, playerId);
  const updatedReserves = onRemovePlayer(reserves, playerId);

  const reservesUpdated = updatedReserves.map((item) =>
    item.player?.posicao_id === playerPositionId ? { ...item, player: undefined } : item
  );

  const lineupUpdated = {
    ...lineup,
    starting: updatedStarting,
    reserves: reservesUpdated,
  };

  return lineupUpdated;
}

export const onGetTeamPrice = (players: LineupPosition[]) =>
  players.reduce((acc, { player }) => acc + (player?.preco_num || 0), 0);

export function onGetPlayerLowestPrice(lineup: LineupPlayers, player: LineupPosition) {
  const playersPosition = lineup.starting.filter((item) => item.position === player.position);

  let lowestPricePlayer = playersPosition[0];

  for (const current of playersPosition) {
    const currentPrice = current.player?.preco_num;

    if (
      currentPrice &&
      (!lowestPricePlayer.player?.preco_num || currentPrice < lowestPricePlayer.player.preco_num)
    ) {
      lowestPricePlayer = current;
    }
  }

  return lowestPricePlayer;
}

export function onRemovePlayerFromSellPlayers(playersSell: PlayersToSell[], id: number) {
  const newPlayersSellList = playersSell.flatMap(
    ({ players, quantityToNewFormation, ...position }) => {
      const updatedPlayers = players.filter((player) => player.player?.atleta_id !== id);

      if (updatedPlayers.length > quantityToNewFormation) {
        return {
          ...position,
          quantityToNewFormation,
          players: updatedPlayers,
        };
      }

      return [];
    }
  );

  return newPlayersSellList;
}

export function onAddPlayerToLineup({ lineup, player, index, isReservePlayer }: AddPlayerProps) {
  const { starting, reserves } = lineup;
  const playersUpdated = isReservePlayer ? [...reserves] : [...starting];

  const addPlayerToIndex = (index: number) => {
    return playersUpdated.map((item, i) =>
      i === index && !item.player ? { ...item, player } : item
    );
  };

  if (typeof index !== 'undefined' && index >= 0 && index < playersUpdated.length) {
    return {
      ...lineup,
      [isReservePlayer ? 'reserves' : 'starting']: addPlayerToIndex(index),
    };
  }

  const emptyIndex = playersUpdated.findIndex(
    (item) => item.position === player.posicao_id && !item.player
  );

  if (emptyIndex !== -1) {
    return {
      ...lineup,
      [isReservePlayer ? 'reserves' : 'starting']: addPlayerToIndex(emptyIndex),
    };
  }

  return lineup;
}

export function onGetPayloadSaveTeam({
  lineup,
  captain,
  formation,
  luxuryReserve,
}: SaveTeamProps): SaveTeamPayload {
  const atletas = lineup.starting.map((position) => position.player?.atleta_id);

  const reservas = lineup.reserves.reduce((obj, reserve) => {
    const index = String(reserve.position);

    const { player } = reserve;
    if (player) {
      (obj as any)[index] = player.atleta_id;
    }
    return obj;
  }, {});

  const esquema = Number(getKeyFormationByValue(formation));
  const capitao = captain;
  const reservaLuxo = getLuxuryReserve(lineup, luxuryReserve);

  return {
    atletas,
    reservas,
    esquema,
    capitao,
    ...(reservaLuxo ? { reserva_luxo_id: reservaLuxo } : {}),
  };
}

export function getKeyFormationByValue(value: string) {
  return Object.keys(LINEUPS_DEFAULT_OBJECT).find(
    (key) => (LINEUPS_DEFAULT_OBJECT as any)[key as any] === value
  );
}

export function onBalancePrice(patrimony: number, price: number) {
  return patrimony - price;
}

import { PlayersToSell } from '@/app/(tabs)/team/team.helpers';
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
  capitain: number;
  tacticalFormation: string;
};

function onRemovePlayer(lineupPlayers: LineupPosition[], playerId: number) {
  const updatedPlayers = lineupPlayers.map((item) => {
    if (item.player?.atleta_id === playerId) {
      return { ...item, player: undefined };
    }
    return item;
  });

  return updatedPlayers;
}

export function onRemovePlayerFromLineup(lineup: LineupPlayers, player: LineupPlayer | FullPlayer) {
  const { atleta_id: playerId } = player;

  const isTeamPlayer = lineup?.starting.some((item) => item.player?.atleta_id === playerId);

  if (isTeamPlayer) {
    const playersUpdated = onRemovePlayer(lineup.starting, playerId);
    const reservesUpdated = lineup.reserves.map((item) => {
      if (item.player?.posicao_id === player.posicao_id) {
        return {
          ...item,
          player: undefined,
        };
      }
      return item;
    });
    const lineupUpdated = {
      ...lineup,
      starting: playersUpdated,
      reserves: reservesUpdated,
    };
    return lineupUpdated;
  }
  const reservesPlayersUpdated = onRemovePlayer(lineup.reserves, playerId);
  const lineupUpdated = { ...lineup, reserves: reservesPlayersUpdated };
  return lineupUpdated;
}

export function onGetTeamPrice(players: LineupPosition[]) {
  return players.reduce((acc, { player }) => {
    const playerPrice = player?.preco_num ?? 0;
    return acc + playerPrice;
  }, 0);
}

export function isLineupComplete(lineup: LineupPlayers) {
  return lineup.starting.every((item) => item.player);
}

export function onGetPlayerLowestPrice(lineup: LineupPlayers, player: LineupPosition) {
  const playersPosition = lineup.starting.filter((item) => item.position === player.position);

  return playersPosition.reduce((acc, current) => {
    const currentPrice = current.player?.preco_num;

    if (!acc.player?.preco_num || (currentPrice && currentPrice < acc.player.preco_num)) {
      return current;
    }

    return acc;
  }, {} as LineupPosition);
}

export function onRemovePlayerFromSellPlayers(playersSell: PlayersToSell[], id: number) {
  const updatedPlayerSell = playersSell
    ?.map((position) => {
      const updatedPlayers = position.players.filter((player) => player.player?.atleta_id !== id);

      return { ...position, players: updatedPlayers };
    })
    .filter((position) => position.players.length > position.quantityToNewFormation);

  return updatedPlayerSell;
}

export function onAddPlayerToLineup({ lineup, player, index, isReservePlayer }: AddPlayerProps) {
  const { starting = [], reserves = [] } = lineup;
  const playersUpdated = isReservePlayer ? [...reserves] : [...starting];

  const addPlayerToIndex = (index: number) => {
    if (!playersUpdated[index]?.player) {
      playersUpdated[index].player = player;
    }
  };

  if (typeof index !== 'undefined' && index >= 0 && index < playersUpdated.length) {
    addPlayerToIndex(index);
  } else {
    const emptyIndex = playersUpdated.findIndex(
      (item) => item.position === player.posicao_id && !item.player
    );
    if (emptyIndex !== -1) {
      addPlayerToIndex(emptyIndex);
    }
  }

  const updatedField = isReservePlayer ? 'reserves' : 'starting';
  const lineupUpdated = {
    ...lineup,
    [updatedField]: playersUpdated,
  };

  return lineupUpdated;
}

export function onGetPayloadSaveTeam({ lineup, capitain, tacticalFormation }: SaveTeamProps) {
  const atletas = lineup.starting.map((position) => position.player?.atleta_id);

  const reservas = lineup.reserves.reduce((obj, reserve, index) => {
    const { player } = reserve;
    if (player) {
      (obj as any)[index + 1] = player.atleta_id;
    }
    return obj;
  }, {});

  const esquema = Number(getKeyFormationByValue(tacticalFormation));
  const capitao = capitain;

  return {
    atletas,
    reservas,
    esquema,
    capitao,
  };
}

export function getKeyFormationByValue(value: string) {
  return Object.keys(LINEUPS_DEFAULT_OBJECT).find(
    (key) => (LINEUPS_DEFAULT_OBJECT as any)[key as any] === value
  );
}

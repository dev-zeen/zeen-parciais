import {
  LineupPlayer,
  LineupPlayers,
  LineupPosition,
} from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";

function onRemovePlayer(lineupPlayers: LineupPosition[], playerId: number) {
  const updatedPlayers = lineupPlayers.map((item) => {
    if (item.player?.atleta_id === playerId) {
      return { ...item, player: undefined };
    }
    return item;
  });

  return updatedPlayers;
}

export function removePlayerFromLineup(
  lineup: LineupPlayers,
  player: LineupPlayer | FullPlayer
) {
  const { atleta_id: playerId } = player;

  const isTeamPlayer = lineup?.starting.some(
    (item) => item.player?.atleta_id === playerId
  );

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

export function onGetPlayerLowestPrice(
  lineup: LineupPlayers,
  player: LineupPosition
) {
  const playersPosition = lineup.starting.filter(
    (item) => item.position === player.position
  );

  return playersPosition.reduce((acc, current) => {
    const currentPrice = current.player?.preco_num;

    if (
      !acc.player?.preco_num ||
      (currentPrice && currentPrice < acc.player.preco_num)
    ) {
      return current;
    }

    return acc;
  }, {} as LineupPosition);
}

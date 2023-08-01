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

  const isTeamPlayer = lineup?.players.find(
    (item) => item.player?.atleta_id === playerId
  );

  if (isTeamPlayer) {
    const playersUpdated = onRemovePlayer(lineup.players, playerId);
    const lineupUpdated = { ...lineup, players: playersUpdated };
    return lineupUpdated;
  }
  const reservePlayersUpdated = onRemovePlayer(lineup.reserves, playerId);
  const lineupUpdated = { ...lineup, reserves: reservePlayersUpdated };
  return lineupUpdated;
}

export function onGetTeamPrice(players: LineupPosition[]) {
  const price = players.reduce((acc, itemLineup) => {
    if (itemLineup.player?.preco_num) {
      return (acc += itemLineup.player?.preco_num);
    }
    return acc;
  }, 0);

  return price;
}

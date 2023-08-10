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

  const isTeamPlayer = lineup?.players.some(
    (item) => item.player?.atleta_id === playerId
  );

  if (isTeamPlayer) {
    const playersUpdated = onRemovePlayer(lineup.players, playerId);
    const lineupUpdated = { ...lineup, players: playersUpdated };
    console.log("executou");

    return lineupUpdated;
  }
  const reservePlayersUpdated = onRemovePlayer(lineup.reserves, playerId);
  const lineupUpdated = { ...lineup, reserves: reservePlayersUpdated };
  return lineupUpdated;
}

export function onGetTeamPrice(players: LineupPosition[]) {
  return players.reduce((acc, { player }) => {
    const playerPrice = player?.preco_num ?? 0;
    return acc + playerPrice;
  }, 0);
}

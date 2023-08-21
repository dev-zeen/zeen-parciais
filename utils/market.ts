import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { LineupPlayer, LineupPosition } from '@/models/Formations';
import { Market } from '@/models/Market';
import { FullPlayer } from '@/models/Stats';

export function filterAndSortPlayersFromMarket(
  market: Market,
  position?: LineupPosition | null | undefined,
  playerLowestPrice?: FullPlayer | LineupPlayer | undefined
) {
  const marketPlayers = market.atletas
    .filter(
      (item) =>
        (!position || item.posicao_id === position.position) &&
        item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL
    )
    .sort((a, b) => b.preco_num - a.preco_num);

  if (playerLowestPrice) {
    return marketPlayers.filter((item) => item.preco_num < playerLowestPrice.preco_num);
  }
  return marketPlayers;
}

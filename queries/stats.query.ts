import { useQuery } from '@tanstack/react-query';

import { GET_SCORED_PLAYERS } from '@/constants/Endpoits';
import { CURRENT_STATS } from '@/constants/Keys';
import { Player, PlayerStats } from '@/models/Stats';
import api from '@/services/api';
import { onSaveStorage } from '@/utils/asyncStorage';

// Filtra e grava uma vez por resposta. No `select` (inline, um por observer) isso
// rodava a cada render de cada um dos componentes que usam as parciais.
const fetchScoredPlayers = async (): Promise<PlayerStats> => {
  const { data } = await api.get<PlayerStats>(GET_SCORED_PLAYERS);
  if (!data.atletas) return data;

  const atletas: { [id: number]: Player } = {};
  Object.keys(data.atletas).forEach((key) => {
    const player = data.atletas[key];
    if (player.entrou_em_campo) {
      atletas[parseInt(key, 10)] = { ...player, id: key };
    }
  });

  const filtered = { ...data, atletas };
  onSaveStorage(CURRENT_STATS, JSON.stringify(filtered)).catch(() => {});
  return filtered;
};

export const useGetScoredPlayers = (isMarketClose?: boolean) =>
  useQuery<PlayerStats>({
    queryKey: [GET_SCORED_PLAYERS],
    queryFn: fetchScoredPlayers,
    refetchInterval: isMarketClose ? 1000 * 30 : false,
    // Ao voltar para o app durante a rodada, atualiza as parciais na hora.
    refetchOnWindowFocus: !!isMarketClose,
  });

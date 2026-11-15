import { FullPlayer, GatoMestreAtletas } from '@/models/Stats';
import { normalizeQuery } from '@/utils/format';

const STATUS_PROVAVEL = 7;

const getMinimoParaValorizar = (player: FullPlayer, gatoMestre?: GatoMestreAtletas) => {
  const value = gatoMestre?.[player.atleta_id]?.minimo_para_valorizar;
  return typeof value === 'number' ? value : Number.POSITIVE_INFINITY;
};

export type SortOption = {
  id: number;
  title: string;
  onSort: (data: FullPlayer[]) => FullPlayer[];
};

export const getSortedOptions = (gatoMestre?: GatoMestreAtletas): SortOption[] => [
  {
    id: 1,
    title: 'Maior preço',
    onSort: (data) => [...data].sort((a, b) => b.preco_num - a.preco_num),
  },
  {
    id: 2,
    title: 'Menor preço',
    onSort: (data) => [...data].sort((a, b) => a.preco_num - b.preco_num),
  },
  {
    id: 3,
    title: 'Maior média',
    onSort: (data) => [...data].sort((a, b) => b.media_num - a.media_num),
  },
  {
    id: 4,
    title: 'Menor mín. p/ valorizar',
    onSort: (data) =>
      [...data].sort(
        (a, b) => getMinimoParaValorizar(a, gatoMestre) - getMinimoParaValorizar(b, gatoMestre)
      ),
  },
];

/** Status do Cartola que o mercado permite filtrar. */
export const statusPlayerOptions = [
  { id: STATUS_PROVAVEL, title: 'Provável' },
  { id: 2, title: 'Dúvida' },
  { id: 3, title: 'Suspenso' },
  { id: 5, title: 'Machucado' },
  { id: 6, title: 'Sem status' },
] as const;

/** Faixas de preço máximo oferecidas no filtro (C$). */
export const PRICE_CEILINGS = [5, 10, 15, 20] as const;
/** Médias mínimas oferecidas no filtro. */
export const MIN_AVERAGES = [2, 4, 6] as const;

export type MarketFilterState = {
  sortId: number;
  statuses: number[];
  clubs: number[];
  /** Preço máximo escolhido (C$); null = sem limite */
  maxPrice: number | null;
  /** Só jogadores que cabem no saldo atual */
  fitsBalance: boolean;
  /** Média mínima; null = qualquer */
  minAverage: number | null;
  search: string;
};

/** Padrão igual ao comportamento anterior: só prováveis, do mais caro ao mais barato. */
export const DEFAULT_MARKET_FILTERS: MarketFilterState = {
  sortId: 1,
  statuses: [STATUS_PROVAVEL],
  clubs: [],
  maxPrice: null,
  fitsBalance: false,
  minAverage: null,
  search: '',
};

type FilterContext = {
  /** Posição aberta no mercado; sem ela, todas as posições */
  positionId?: number;
  /** Modo reserva: só jogadores mais baratos que o titular mais barato da posição */
  reserveCeiling?: number;
  balance: number;
  gatoMestre?: GatoMestreAtletas;
};

/** Deriva a lista do mercado a partir do estado dos filtros. Função pura. */
export function applyMarketFilters(
  players: FullPlayer[],
  filters: MarketFilterState,
  { positionId, reserveCeiling, balance, gatoMestre }: FilterContext
): FullPlayer[] {
  const query = normalizeQuery(filters.search.trim());
  const statuses = new Set(filters.statuses);
  const clubs = new Set(filters.clubs);

  const filtered = players.filter(
    (player) =>
      (positionId === undefined || player.posicao_id === positionId) &&
      (reserveCeiling === undefined || player.preco_num < reserveCeiling) &&
      (statuses.size === 0 || statuses.has(player.status_id)) &&
      (clubs.size === 0 || clubs.has(player.clube_id)) &&
      (filters.maxPrice === null || player.preco_num <= filters.maxPrice) &&
      (!filters.fitsBalance || player.preco_num <= balance) &&
      (filters.minAverage === null || player.media_num >= filters.minAverage) &&
      (!query || normalizeQuery(player.apelido).includes(query))
  );

  const sort =
    getSortedOptions(gatoMestre).find((option) => option.id === filters.sortId) ??
    getSortedOptions(gatoMestre)[0];

  return sort.onSort(filtered);
}

/** Filtros da folha que diferem do padrão (busca e ordenação ficam de fora). */
export function countActiveFilters(filters: MarketFilterState) {
  const sameStatuses =
    filters.statuses.length === DEFAULT_MARKET_FILTERS.statuses.length &&
    filters.statuses.every((id) => DEFAULT_MARKET_FILTERS.statuses.includes(id));

  return (
    (sameStatuses ? 0 : 1) +
    (filters.clubs.length > 0 ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.fitsBalance ? 1 : 0) +
    (filters.minAverage !== null ? 1 : 0)
  );
}

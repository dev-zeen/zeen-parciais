import { FullPlayer, GatoMestreAtletas } from '@/models/Stats';

const getMinimoParaValorizar = (player: FullPlayer, gatoMestre?: GatoMestreAtletas) => {
  const value = gatoMestre?.[player.atleta_id]?.minimo_para_valorizar;
  return typeof value === 'number' ? value : Number.POSITIVE_INFINITY;
};

export const getSortedOptions = (gatoMestre?: GatoMestreAtletas) => [
  {
    id: 1,
    title: 'Mais Caros',
    onSort: (data: FullPlayer[]) => [...data].sort((a, b) => b.preco_num - a.preco_num),
  },
  {
    id: 2,
    title: 'Mais Baratos',
    onSort: (data: FullPlayer[]) => [...data].sort((a, b) => a.preco_num - b.preco_num),
  },
  {
    id: 3,
    title: 'Maior Média',
    onSort: (data: FullPlayer[]) => [...data].sort((a, b) => b.media_num - a.media_num),
  },
  {
    id: 4,
    title: 'Min. Val.',
    onSort: (data: FullPlayer[]) =>
      [...data].sort(
        (a, b) => getMinimoParaValorizar(a, gatoMestre) - getMinimoParaValorizar(b, gatoMestre)
      ),
  },
];

export const statusPlayerOptions = [
  {
    id: 7,
    title: 'Provável',
    selected: true,
  },
  {
    id: 2,
    title: 'Dúvida',
    selected: false,
  },
  {
    id: 3,
    title: 'Suspenso',
    selected: false,
  },
  {
    id: 5,
    title: 'Machucado',
    selected: false,
  },
  {
    id: 6,
    title: 'Sem status',
    selected: false,
  },
];

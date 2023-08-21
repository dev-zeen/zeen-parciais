import { FullPlayer } from '@/models/Stats';

export const sortedOptions = [
  {
    id: 1,
    title: 'Mais Caros',
    onSort: (data: FullPlayer[]) => data.sort((a, b) => b.preco_num - a.preco_num),
  },
  {
    id: 2,
    title: 'Mais Baratos',
    onSort: (data: FullPlayer[]) => data.sort((a, b) => a.preco_num - b.preco_num),
  },
  {
    id: 3,
    title: 'Maior Média',
    onSort: (data: FullPlayer[]) => data.sort((a, b) => b.media_num - a.media_num),
  },
  {
    id: 4,
    title: 'Min. Val.',
    onSort: (data: FullPlayer[]) =>
      data.sort((a, b) => a.minimo_para_valorizar - b.minimo_para_valorizar),
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

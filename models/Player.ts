import { Position } from '@/models/Stats';

export type IPlayerStatus = Omit<Position, 'abreviacao'>;

export type PlayerStatus = {
  [key: string]: IPlayerStatus;
};

export interface TopPlayer {
  posicao: string;
  posicao_abreviacao: string;
  clube: string;
  clube_nome: string;
  escudo_clube: string;
  Atleta: {
    nome: string;
    apelido: string;
    apelido_abreviado: string;
    foto: string;
    atleta_id: number;
    preco_editorial: number;
  };
  clube_id: number;
  escalacoes: number;
}

export type Appreciations = {
  atletas: {
    [key: string]: {
      posicao_id: number;
      variacao_num: number;
    };
  };
};

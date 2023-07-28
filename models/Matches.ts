import { IClub } from "@/models/Club";

export interface Match {
  aproveitamento_mandante: Array<"d" | "e" | "v">;
  aproveitamento_visitante: Array<"d" | "e" | "v">;
  campeonato_id: number;
  clube_casa_id: number;
  clube_casa_posicao: number;
  clube_visitante_id: number;
  clube_visitante_posicao: number;
  inicio_cronometro_tr?: string;
  local: string;
  partida_data: string;
  partida_id: number;
  periodo_tr?: string;
  placar_oficial_mandante?: string;
  placar_oficial_visitante?: string;
  status_cronometro_tr?: string;
  status_transmissao_tr?: "CRIADA" | "EM_ANDAMENTO" | "ENCERRADA";
  timestamp: number;
  transmissao: {
    label: string;
    url: string;
  };
  valida: boolean;
}

export interface Matches {
  partidas: Match[];
  clubes: IClub;
  rodada: number;
}

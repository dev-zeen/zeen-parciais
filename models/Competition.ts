export type CompetitionPrivacy = 'A' | 'F';

export type PointsCompetitionTeam = {
  rodada_time_id: number;
  nome: string;
  nome_cartola: string;
  foto_perfil: string;
  url_escudo_png: string;
  url_escudo_svg: string;
  anonimizado: boolean;
  time_id: number;
  assinante: boolean;
};

export type PointsCompetitionTeamsMap = Record<string, PointsCompetitionTeam>;

export type PointsCompetitionDetails = {
  participantes: PointsCompetitionTeamsMap;
  convidados: PointsCompetitionTeamsMap;
  data_inicio: string;
  data_fim: string;
  privacidade: CompetitionPrivacy;
  url_taca_svg: string;
  url_taca_png: string;
  nome: string;
  criacao: string;
  slug: string;
  descricao: string;
  patrocinador_id: number | null;
  id: number;
  time_dono_id: number;
  tipo_taca_id: number;
  sorteada: boolean;
  rodada_inicial: number;
  rodada_final: number;
  tem_returno: boolean;
  cor_taca_id: number;
  finalizada: boolean;
  quantidade_participantes: number;
  quantidade_times: number;
  membro: boolean;
};

/**
 * Listagem de Pontos Corridos (GET /auth/competicoes/pontoscorridos).
 * Campos exatos podem variar; mantemos um core mínimo usado na UI.
 */
export type PointsCompetitionListItem = {
  id: number;
  slug: string;
  nome: string;
  descricao: string;
  privacidade: CompetitionPrivacy;
  quantidade_participantes: number;
  quantidade_times: number;
  membro: boolean;
  time_dono_id: number;
  url_taca_png?: string;
  url_taca_svg?: string;
};

export type PointsCompetitionListResponse = {
  competicoes: PointsCompetitionListItem[];
};

/**
 * Convites de Pontos Corridos (GET /auth/competicoes/convites)
 * Estrutura real da API.
 */
export type PointsCompetitionInvite = {
  id: number;
  data: string;
  competicao: {
    nome: string;
    tipo: string;
    privacidade: CompetitionPrivacy;
    slug: string;
    path: string;
    url_asset_png: string;
    url_asset_svg: string;
    id: number;
  };
  remetente: {
    nome: string;
    nome_cartola: string;
    foto_perfil: string;
    url_escudo_png: string;
    url_escudo_svg: string;
    time_id: number;
    assinante: boolean;
  };
};

export type PointsCompetitionInvitesResponse = PointsCompetitionInvite[];

export type RespondCompetitionInviteInput = {
  messageId: number;
  decision: 'accept' | 'decline';
};

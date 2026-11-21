import { env } from '@/lib/env';

export const EXPO_PUBLIC_API_URL = env.EXPO_PUBLIC_API_URL;
export const EXPO_PUBLIC_AUTH_URL = env.EXPO_PUBLIC_AUTH_URL;

export const GET_POSITIONS = '/posicoes';
export const GET_MY_CLUB = '/auth/time'; // @Controller('/api/v1/team/my-team')
export const GET_CLUB_HISTORY = '/auth/stats/historico';
/** Cada salvamento do time na rodada (mais recente primeiro) */
export const GET_LINEUP_HISTORY = '/auth/time/historico/:round';
/** Níveis do cartoleiro (Inicial … Diamante) */
export const GET_RANKING_LEVELS = '/rankings';
export const GET_NEWS = '/auth/noticias';
export const GET_NEWS_GATO_MESTRE = '/auth/noticias/gatomestre';
export const GET_CLUB_BY_ID = '/time/id/:id';
export const GET_CLUB_BY_ID_AND_ROUND = '/time/id/:id/:round';
export const GET_CLUBS_BY_LEAGUE_ID = '/liga/:id/times';
export const GET_MATCH_SUBSTITUTIONS = '/time/substituicoes/:clubId';
export const GET_MATCH_SUBSTITUTIONS_BY_ROUND = '/time/substituicoes/:clubId/:round';
export const SAVE_TEAM = '/auth/time/salvar';
/** GET: status da doação; POST (sem corpo): recebe a doação de volta a C$ 100 */
export const CARTOLETAS_DONATION = '/auth/reset/cartoletas';

export const MATCHES_ACTUAL_ROUND = '/partidas'; // @Controller('/api/v1/matches')
export const MATCHES_BY_ROUND = '/partidas/:round'; // @Controller('/api/v1/matches/:round')

export const GET_MARKET_STATUS = '/mercado/status';
export const GET_MARKET = '/atletas/mercado';

export const GET_APPRECIATIONS = '/auth/atletas/valorizacao'; //
export const GET_SCORED_PLAYERS = '/atletas/pontuados';
export const GET_TOP_RANKED_PLAYERS = 'auth/mercado/destaques';
export const GET_TOP_RESERVE_PLAYERS = 'auth/mercado/destaques/reservas';
export const GET_TOP_PLAYERS = 'auth/mercado/selecao';
export const GET_PLAYER_STATS_BY_ID = '/auth/mercado/atleta/:playerId/pontuacao';
export const GET_GATO_MESTRE_ATLETAS = '/auth/gatomestre/atletas';

export const GET_LEAGUE_BY_SLUG = '/auth/liga/:slug'; // @Controller('/api/v1/leagues/:slug')
export const GET_ALL_LEAGUES = '/auth/ligas'; // @Controller('/api/v1/leagues')
// Ligas encerradas; a API devolve [] quando não há nenhuma
export const GET_FINISHED_CLASSIC_PUBLIC = '/auth/competicoes/classica/publicas/finalizados';
export const GET_FINISHED_CLASSIC_PRIVATE = '/auth/competicoes/classica/privadas/finalizados';
export const GET_FINISHED_CUPS = '/auth/competicoes/mata-mata/finalizados';
export const INVITES = '/auth/convites';
export const RESPONSE_INVITE = '/auth/mensagem/:messageId';
export const CREATE_LEAGUE = '/auth/liga';
export const INVITE_LEAGUE = '/auth/liga/:slug/convidar';

export const REFRESH_TOKEN = '/refresh';

// Ligas
// TODO AINDA VAI SER IMPLEMENTADO
export const QUIT_LEAGUE = '/auth/liga/:slug/associacao';

// Pontos Corridos
export const GET_POINTS_COMPETITIONS = '/auth/competicoes/pontoscorridos';
export const GET_POINTS_COMPETITIONS_FINALIZADAS = '/auth/competicoes/pontoscorridos/finalizadas';
export const GET_POINTS_COMPETITION_BY_SLUG = '/auth/competicoes/pontoscorridos/slug/:slug';
export const INVITES_POINTS_COMPETITIONS = '/auth/competicoes/convites';
export const RESPONSE_INVITE_POINTS_COMPETITIONS = '/auth/competicoes/convites/:messageId';
export const INVITE_POINTS_COMPETITION = '/auth/competicoes/pontoscorridos/slug/:slug/convidar';

// Busca
export const SEARCH_TEAMS = '/times';

export const EXPO_PUBLIC_API_URL = 'https://api.cartola.globo.com';
export const EXPO_PUBLIC_AUTH_URL = 'https://cartola.globo.com/#!/login';

export const GET_POSITIONS = '/posicoes';
export const GET_MY_CLUB = '/auth/time'; // @Controller('/api/v1/team/my-team')
export const GET_CLUB_HISTORY = '/auth/stats/historico';
export const GET_CLUB_BY_ID = '/time/id/:id';
export const GET_CLUB_BY_ID_AND_ROUND = '/time/id/:id/:round';
export const GET_CLUBS_BY_LEAGUE_ID = '/liga/:id/times';
export const GET_MATCH_SUBSTITUTIONS = '/time/substituicoes/:clubId';
export const GET_MATCH_SUBSTITUTIONS_BY_ROUND = '/time/substituicoes/:clubId/:round';
export const SAVE_TEAM = '/auth/time/salvar';

export const MATCHES_ACTUAL_ROUND = '/partidas'; // @Controller('/api/v1/matches')
export const MATCHES_BY_ROUND = '/partidas/:round'; // @Controller('/api/v1/matches/:round')

export const GET_MARKET_STATUS = '/mercado/status';
export const GET_MARKET = '/atletas/mercado';

export const GET_APPRECIATIONS = '/auth/atletas/valorizacao'; //
export const GET_SCORED_PLAYERS = '/atletas/pontuados';
export const GET_TOP_RANKED_PLAYERS = 'auth/mercado/destaques';
export const GET_TOP_RESERVE_PLAYERS = 'auth/mercado/destaques/reservas';
export const GET_TOP_PLAYERS = 'auth/mercado/selecao';

export const GET_LEAGUE_BY_SLUG = '/auth/liga/:slug'; // @Controller('/api/v1/leagues/:slug')
export const GET_ALL_LEAGUES = '/auth/ligas'; // @Controller('/api/v1/leagues')
export const INVITES = '/auth/convites';
export const RESPONSE_INVITE = '/auth/mensagem/:messageId';

export const REFRESH_TOKEN = '/refresh';

// Ligas
// TODO AINDA VAI SER IMPLEMENTADO
export const QUIT_LEAGUE = '/auth/liga/:slug/associacao';

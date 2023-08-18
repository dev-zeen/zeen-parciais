export const GET_POSITIONS = "/posicoes";

export const GET_CLUB_BY_ID = "/time/id/:id";
export const GET_CLUB_BY_ID_AND_ROUND = "/time/id/:id/:round";

export const GET_MATCH_SUBSTITUTIONS = "/time/substituicoes/:clubId";
export const GET_MATCH_SUBSTITUTIONS_BY_ROUND =
  "/time/substituicoes/:clubId/:round";

export const GET_CLUBS_BY_LEAGUE_ID = "/liga/:id/times";

export const GET_SCORED_PLAYERS = "/atletas/pontuados";

export const GET_MARKET_STATUS = "/mercado/status";
export const GET_MARKET = "/atletas/mercado";
export const GET_TOP_RANKED_PLAYERS = "/mercado/destaques";
export const GET_TOP_RESERVE_PLAYERS = "/mercado/destaques/reservas";
export const GET_TOP_PLAYERS = "/mercado/selecao";

export const MATCHES_ACTUAL_ROUND = "/partidas";
export const MATCHES_BY_ROUND = "/partidas/:round";

// Auth
export const IS_MEMBER_CARTOLA_EXPRESS = "/auth/express";
export const GET_APPRECIATIONS = "/auth/atletas/valorizacao";
export const GET_MY_CLUB = "/auth/time";
export const GET_CLUB_HISTORY = "/auth/stats/historico";
export const GET_LEAGUE_BY_SLUG = "/auth/liga/:slug";
export const GET_ALL_LEAGUES = "/auth/ligas";
export const REFRESH_TOKEN = "/refresh";
export const SAVE_TEAM = "/auth/time/salvar";

// Logout
export const LOGOUT =
  "https://id.globo.com/auth/realms/globo.com/.well-known/openid-configuration";

// Ligas
// TODO AINDA VAI SER IMPLEMENTADO
export const QUIT_LEAGUE = "/auth/liga/:slug/associacao";

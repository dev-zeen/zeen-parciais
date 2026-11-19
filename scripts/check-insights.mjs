/**
 * Confere utils/insights.ts com as respostas reais capturadas em docs/requests.json.
 * Lê só os corpos das respostas; nenhum cabeçalho (token, cookie) é usado.
 * A captura não inclui /partidas, então a rodada é montada com clubes reais do mercado.
 *
 * Uso: node scripts/check-insights.mjs
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import {
  buildLineupProjection,
  buildPlayerInsight,
  formatCountdown,
  selectionRate,
} from '../utils/insights.ts';

const capturePath = new URL('../docs/requests.json', import.meta.url);
if (!existsSync(capturePath)) {
  console.error(
    'docs/requests.json não encontrado.\n' +
      'Este script usa uma captura local das respostas da API do Cartola, que fica fora do git\n' +
      'por conter tokens de sessão. Gere a captura (cURLs + respostas) em docs/requests.json\n' +
      'e rode de novo: node scripts/check-insights.mjs'
  );
  process.exit(1);
}
const raw = readFileSync(capturePath, 'utf8');

/** Corpo JSON da resposta que segue o curl do endpoint informado. */
function responseOf(path) {
  const start = raw.indexOf(`curl --url 'https://api.cartola.globo.com${path}'`);
  assert.notEqual(start, -1, `captura de ${path} não encontrada`);
  const next = raw.indexOf('\ncurl ', start + 1);
  const block = raw.slice(start, next === -1 ? undefined : next);
  const body = block.split('\n').find((line) => /^\s*[[{]/.test(line));
  return JSON.parse(body);
}

const gatoMestre = responseOf('/auth/gatomestre/atletas');
const market = responseOf('/atletas/mercado');
const team = responseOf('/auth/time');
const status = responseOf('/mercado/status');
const highlights = responseOf('/auth/mercado/destaques/reservas');

// Rodada sintética: clubes reais em pares, primeiro de cada par é o mandante.
const clubIds = Object.keys(market.clubes).map(Number);
const partidas = [];
for (let i = 0; i + 1 < clubIds.length; i += 2) {
  partidas.push({
    clube_casa_id: clubIds[i],
    clube_visitante_id: clubIds[i + 1],
    aproveitamento_mandante: ['v', 'e', 'd'],
    aproveitamento_visitante: ['d', 'd', 'v'],
    clube_casa_posicao: 1,
    clube_visitante_posicao: 2,
  });
}
const matches = { partidas, clubes: market.clubes, rodada: status.rodada_atual };
const homeClubs = new Set(partidas.map((item) => item.clube_casa_id));

// 1. Mando e média do mando para todos os jogadores do mercado
let withData = 0;
for (const player of market.atletas) {
  const insight = buildPlayerInsight(player, gatoMestre, matches);
  const data = gatoMestre[player.atleta_id];

  assert.ok(insight.match, `sem confronto para o clube ${player.clube_id}`);
  assert.equal(insight.match.isHome, homeClubs.has(player.clube_id));
  assert.notEqual(insight.match.opponent?.id, player.clube_id);

  if (data) {
    withData += 1;
    const expected = insight.match.isHome ? data.media_pontos_mandante : data.media_pontos_visitante;
    assert.equal(insight.avgVenue, expected ?? null);
    assert.equal(insight.projected, expected ?? player.media_num ?? 0);
    assert.equal(insight.minToValorize, data.minimo_para_valorizar ?? null);
  } else {
    assert.equal(insight.hasGatoMestre, false);
    assert.equal(insight.projected, player.media_num ?? 0);
  }
}
console.log(`ok  mando e média: ${market.atletas.length} jogadores, ${withData} com Gato Mestre`);

// 2. Sem Gato Mestre e sem partidas a projeção cai para a média geral
const sample = market.atletas[0];
assert.equal(buildPlayerInsight(sample).projected, sample.media_num ?? 0);
assert.equal(buildPlayerInsight(sample).match, undefined);
console.log('ok  reserva para a média geral quando faltam dados');

// 3. Projeção do time real capturado, com capitão x1,5
const getInsight = (player) => buildPlayerInsight(player, gatoMestre, matches);
const projection = buildLineupProjection(team.atletas, team.capitao_id, getInsight);
const manual = team.atletas.reduce(
  (sum, player) =>
    sum + getInsight(player).projected * (player.atleta_id === team.capitao_id ? 1.5 : 1),
  0
);
assert.ok(Math.abs(projection.projected - manual) < 1e-9);
assert.equal(projection.filled, team.atletas.length);
assert.equal(projection.home + projection.away + projection.withoutMatch, team.atletas.length);
assert.equal(
  projection.unlikely.length,
  team.atletas.filter((player) => player.status_id !== 7).length
);
console.log(
  `ok  projeção do time: ${projection.projected.toFixed(2)} pts, ${projection.home} em casa, ` +
    `${projection.away} fora, ${projection.unlikely.length} fora de "Provável"`
);

// 4. Vagas vazias são ignoradas
assert.equal(buildLineupProjection([undefined, undefined], 0, getInsight).filled, 0);
console.log('ok  vagas vazias ignoradas');

// 5. Porcentagem de escalação
for (const item of highlights) {
  const rate = selectionRate(item.escalacoes, status.times_escalados);
  assert.ok(rate > 0 && rate <= 100);
  assert.ok(Math.abs(rate - (item.escalacoes / status.times_escalados) * 100) < 1e-9);
}
assert.equal(selectionRate(10, 0), null);
assert.equal(selectionRate(undefined, 100), null);
const first = highlights[0];
console.log(
  `ok  % de escalação: ${first.Atleta.apelido} ${selectionRate(first.escalacoes, status.times_escalados).toFixed(1)}%`
);

// 6. Contagem regressiva
assert.equal(formatCountdown(0), null);
assert.equal(formatCountdown(-5), null);
assert.equal(formatCountdown((2 * 86400 + 4 * 3600 + 30 * 60) * 1000), '2d 4h');
assert.equal(formatCountdown((4 * 3600 + 5 * 60) * 1000), '4h 05min');
assert.equal(formatCountdown((12 * 60 + 5) * 1000), '12min 05s');
const closing = status.fechamento;
const closingDate = Date.UTC(closing.ano, closing.mes - 1, closing.dia, closing.hora + 3, closing.minuto);
assert.equal(closing.timestamp * 1000, closingDate, 'timestamp de fechamento bate com a data (BRT)');
console.log('ok  contagem regressiva e timestamp de fechamento');

console.log('\nTudo certo.');

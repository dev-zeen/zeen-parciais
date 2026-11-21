# Plano de melhorias — status

Benchmark com FPL, Cartola FC e LaLiga Fantasy. Status em 19/11/2026.
Regras de cada funcionalidade: [funcionalidades-e-regras.md](funcionalidades-e-regras.md).

> Requer novo build nativo (prebuild/EAS): `expo-notifications`, `expo-sharing` e
> `react-native-view-shot` foram adicionados. Update OTA não basta.

## Parte A — Produto

| # | Item | Status | Onde |
|---|---|---|---|
| 1 | Lembrete de fechamento do mercado (24h, 2h, 30min) | ✅ Implementado | `hooks/useMarketCloseReminders.ts`, `lib/marketReminders.ts`, toggle no Perfil |
| 2 | Variação de posição ao vivo na liga | ✅ Implementado | `app/(tabs)/leagues/league/[id].tsx` |
| 3 | Diferenciais contra um rival na rodada | ✅ Implementado | `components/contexts/leagues/RivalDiffCard.tsx` |
| 4 | Alertas de escalação completos | ✅ Implementado | `components/contexts/home/AlertsCard.tsx` |
| 5 | Calendário de dificuldade dos confrontos | ✅ Implementado | aba Calendário na Rodada, `components/contexts/matches/FixtureTicker` |
| 6 | Projeção de valorização | ✅ Implementado | "Valorizam X/Y" no Raio-X da escalação |
| 7 | Sugestão de capitão | ✅ Implementado | Raio-X da escalação, botão "Escolher" |
| 8 | Comparar 2 jogadores | ✅ Implementado | Mercado, segurar o card, `components/contexts/market/PlayerCompare` |
| 9 | % de escalação no mercado | ✅ Implementado | "Esc X%" no card do mercado |
| 10 | Compartilhar como imagem | ✅ Implementado | Escalação atual na aba Time (`components/contexts/team/ShareLineupCard.tsx`); qualquer liga (clássica, mata-mata, pontos corridos) pelo cabeçalho (`components/contexts/leagues/ShareLeagueCard.tsx`) |
| 11 | Histórico da temporada | ⏭️ Já existia | Perfil (gráfico, melhor e pior rodada) |
| 12 | Reserva de luxo | ✅ Implementado | Ficha do reserva (`TeamPlayerCard`), selo "L" no banco, `reserva_luxo_id` em `onGetPayloadSaveTeam` (`utils/team.ts`) |
| 13 | Widget / Live Activity | ❌ Não implementado | Precisa de target nativo; fica como projeto separado |

### Limitações conhecidas

- **1:** com o app fechado, tocar na notificação pode não abrir a aba Time se a navegação ainda não estiver pronta.
- **2:** a variação aparece nos períodos mês, turno e campeonato. Não aparece no turno da rodada 20, que recomeça do zero.
- **3:** ao vivo, não considera as substituições automáticas do banco.
- **5:** depende de `/partidas/:rodada` devolver rodadas futuras. A dificuldade usa a posição atual do adversário.
- **6:** é uma estimativa (projeção ≥ mínimo do Gato Mestre), não a fórmula oficial.
- **9:** só aparece para jogadores da lista de mais escalados (`auth/mercado/destaques`).
- **10:** a imagem da liga cobre todos os status: ao vivo, rodada em andamento, mercado aberto, não iniciada, aguardando sorteio e encerrada (com campeão). As tabelas trazem todos os times da lista da tela, até o limite de segurança de 100. O mata-mata mostra a fase selecionada na tela. A imagem da escalação usa a escalação da tela, mesmo antes de salvar.

## Parte B — Técnico

| # | Item | Status | Onde |
|---|---|---|---|
| T1 | Gravação de parciais no AsyncStorage a cada render | ✅ Corrigido | `queries/stats.query.ts` |
| T2 | Polling em segundo plano / atualizar ao voltar ao app | ✅ Corrigido | `app/_providers.tsx` (focusManager + AppState) |
| T3 | Refresh de token concorrente | ✅ Corrigido | `services/api.ts` (fila única, 1 repetição por requisição) |
| T4 | Cache manual duplicado de parciais (`usePlayerStats`) | ❌ Não implementado | Ainda lê o AsyncStorage à parte |
| T5 | Testes das funções puras | ✅ Implementado | `utils/__tests__` (38 testes), `npm run test:unit` |
| T6 | Remover `react-native-chart-kit` | ❌ Não implementado | Dependia do item 11, que já existia |
| T7 | Token em memória | ❌ Não implementado | Ganho pequeno |
| T8 | Dividir telas grandes | ✅ Implementado | Perfil 905→380 linhas (`components/contexts/profile`, `utils/profileStats.ts`); Time 613→439 (`useFormationChange`, `useMarketSheet`); Mercado 588→438 (`MarketHeader`, `MarketToolbar`, `getActiveFilterChips`) |

### Fora do plano, corrigido

- **Doação de cartoletas** (✅ implementado): um card na aba Time oferece a doação de volta a C$ 100 quando a API permite e o patrimônio está abaixo disso. Ver `utils/donation.ts` e `components/contexts/team/DonationCard.tsx`.
- **Refresh do GloboID** (`lib/core/auth.ts`, `utils/globoid.ts`). Antes, a chamada usava `/v1`, com corpo e resposta fora do contrato real. Na prática, o refresh nunca funcionava e deslogava o usuário sem aviso. Agora usa `/v2/refresh-token` (`globo_id` + `tokens[]`) e lê `results[].tokens`. Se o GloboID recusar (4xx), o usuário é deslogado. Erros de rede e 5xx não deslogam.
- **Alertas com uma cor só:** removida a barra lateral do `AlertsCard`.

### Qualidade de código

- O typecheck e o lint estão sem erros (antes: 3 erros de tipo e 9 de lint). Correções em `Themed.tsx`, `MaintenanceMarket.tsx`, `SkeletonLoader.tsx`, `AnimatedCard.tsx` e `useValorization.ts`, sem mudar comportamento.
- `npm run check` roda typecheck, lint e testes unitários em um comando.
- `.gitattributes` força LF em todo o repositório.
- Hook do Claude Code (`.claude/settings.json`) roda Prettier e ESLint em cada arquivo editado por agentes.

### Pendências de ambiente

- O preset `jest-expo` não roda porque o `expo-modules-core` está aninhado em `node_modules/expo/`. Os testes unitários usam o `jest.unit.config.js`, sem o preset.
- Nada foi validado no aparelho. Precisam de teste manual: notificações, compartilhamento, calendário e refresh com token vencido.

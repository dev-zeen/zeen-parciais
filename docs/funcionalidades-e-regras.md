# Funcionalidades e regras do app

Referência das regras de negócio do Parciais FC. Quando uma regra muda no código, este
documento deve mudar junto. Status do plano de melhorias: [plano-melhorias.md](plano-melhorias.md).

## Domínio (Cartola FC)

### Status do mercado — `constants/Market.ts`

| Código | Nome | Efeito no app |
| --- | --- | --- |
| 1 | Aberto | Escalação editável; mercado compra e vende; lembretes agendados |
| 2 | Fechado | Rodada em andamento: parciais ao vivo, escalação só leitura |
| 3 | Em atualização | Tratado como fechado |
| 4 | Em manutenção | Telas protegidas mostram `MaintenanceMarket`; nenhuma consulta autenticada |

- `isMarketClose` = status ≠ 1.
- `allowRequest` = autenticado **e** status ≠ 4. Toda consulta autenticada depende dele.
- `bola_rolando` controla o selo de "ao vivo" na barra de abas.

### Status do jogador — `constants/StatusPlayer.ts`

`7` Provável · `2` Dúvida · `3` Suspenso · `5` Contundido · `6` Nulo. Qualquer status diferente de 7 é tratado como "pode não jogar" nos alertas e insights.

### Pontuação

- **Parcial do time** = soma da pontuação de quem entrou em campo + **50% do capitão** (capitão vale ×1,5). Ver `utils/partials.ts`.
- **Ligas `sem_capitao`** não somam o bônus do capitão.
- **Substituições automáticas** vêm da API (`/time/substituicoes`): o reserva que entrou ocupa o lugar do titular nas parciais.
- **Parcial ao vivo da liga** (`utils/leagues.ts`): soma a parcial a rodada, mês, turno e campeonato. Na rodada 20 o turno recomeça (vale só a parcial).

### Escalação — `utils/team.ts`, `store/useTeamLineupStore.ts`

- **Formações:** 3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2, 5-4-1. Trocar de formação pede para vender o excedente de cada posição.
- **Saldo** = patrimônio − valor da escalação. O mercado bloqueia a compra sem saldo ou sem vaga.
- **Reserva** precisa custar **menos que o titular mais barato** da posição.
- A escalação editada fica no store até salvar. A aba Time mostra o badge "1" quando a escalação na tela é diferente da salva.
- **Salvar** envia `atletas`, `reservas` (por posição), `esquema`, `capitao` e, se houver, `reserva_luxo_id` (`SAVE_TEAM`).
- **Reserva de luxo** (`luxuryReserve` na store; `getLuxuryReserve` em `utils/team.ts`):
  - É um dos reservas já escalados; só existe 1 por rodada. Escolhido na ficha do reserva e marcado com "L" no banco.
  - Salvar com algum reserva no banco e sem luxo mostra um alerta com as opções "Voltar e escolher" e "Salvar sem". Ele vem depois do aviso de banco incompleto.
  - Só é enviado se o jogador ainda estiver no banco. Vender o reserva, ou o titular da posição (que esvazia o reserva), desfaz o luxo.
  - Regra da Globo: substitui o titular da posição com a pior pontuação, se pontuar mais que ele, e só se todos os titulares da posição jogarem. No empate da pior nota, o capitão sai primeiro.
  - A substituição é feita pela Globo e chega em `/time/substituicoes`; o app não a calcula.

### Mercado — `components/contexts/market/MarketFilters/filters.helper.ts`

- **Padrão:** só prováveis, ordenados do mais caro ao mais barato.
- **Filtros:** status, clube, preço máximo, "cabe no saldo", média mínima e busca por nome (sem acento).
- **Ordenações:** maior preço, menor preço, maior média e menor mínimo para valorizar.
- **Toque duplo** no mesmo jogador em menos de 600 ms é ignorado.

### Insights — `utils/insights.ts`

- **Projeção** = média do jogador no mando da rodada (Gato Mestre); sem esse dado, a média geral.
- **Mínimo para valorizar** vem do Gato Mestre (recurso PRO; sem PRO o dado fica vazio).
- **"Valorizam X/Y"** = titulares cuja projeção cobre o mínimo para valorizar.
- **Capitão sugerido** = titular provável, com jogo na rodada e maior projeção.
- **% de escalação** = `escalacoes / times_escalados`. Só existe para quem está na lista de mais escalados.

### Ligas

| Modalidade | Classificação | Arquivo |
| --- | --- | --- |
| Clássica | Por período (rodada, mês, turno, campeonato, capitão, patrimônio); desempate pelo patrimônio | `app/(tabs)/leagues/league/[id].tsx` |
| Mata-mata | Fases P (1ª fase), O, Q, S, T (3º lugar), F; vencedor por confronto | `components/contexts/leagues/Cup` |
| Pontos corridos | 3 pontos a vitória, 1 o empate. Critérios: pontos, vitórias, saldo, pontuação feita | `utils/pointsStandings.ts` |

- Com a rodada ao vivo, a clássica mostra ▲▼ de posições ganhas na rodada (mês, turno e campeonato). Com o mercado aberto, mostra a variação oficial.
- **Diferenciais** contra um rival (`utils/rivals.ts`): os jogadores em comum se anulam; a diferença vem dos exclusivos e dos capitães.

### Calendário — `utils/fixtures.ts`

Dificuldade pela posição atual do adversário: 1º–5º = 4 (difícil), 6º–10º = 3, 11º–15º = 2, 16º–20º = 1 (fácil). Clubes ordenados pela média da dificuldade nas próximas 5 rodadas.

## Funcionalidades por aba

| Aba | O que tem |
| --- | --- |
| **Início** | Status do mercado, convites, resumo do time, estatísticas, capitão, alertas (fechamento em menos de 24h, sem capitão, titular sem jogo, jogador com problema) e destaques da rodada |
| **Time** | Campinho editável, formação, banco, Raio-X (projeção, mando, valorização, capitão sugerido, jogadores em risco com "Trocar"), salvar e compartilhar a escalação |
| **Mercado** (modal da aba Time) | Filtros, ordenação, mínimo para valorizar, % de escalação, comparar 2 jogadores (segurar o card) |
| **Rodada** | Jogadores pontuados (ao vivo ou da última rodada), partidas e calendário de dificuldade |
| **Ligas** | Clássica, mata-mata e pontos corridos; criação, convites, pedidos; tela do adversário com temporada, confronto direto e diferenciais; compartilhar qualquer liga |
| **Perfil** | Dados do cartoleiro, histórico da temporada (gráfico, melhor e pior rodada), tema e lembrete de fechamento |

## Regras técnicas

### Dados e atualização

- **React Query** é a única fonte de dados remotos. Os padrões globais estão em `app/_providers.tsx`: `retry: 1`, sem refetch ao montar, refetch ao reconectar.
- **Polling:** parciais a cada 30 s com o mercado fechado; status do mercado a cada 60 s. Tudo pausa em segundo plano (`focusManager` + `AppState`) e atualiza ao voltar ao app.
- **Última parcial** fica gravada em `@current_stats` para abrir o app com dados (gravada no `queryFn`, uma vez por resposta).

### Autenticação — `lib/core/auth.ts`, `services/api.ts`, `utils/globoid.ts`

- **Login:** WebView com o login da Globo; os tokens (`access`, `refresh`, `id`) são lidos do `localStorage` da página e gravados em `@access_token`.
- **Requisições:** toda requisição envia `Bearer access_token`.
- **Erro 401:** um único refresh é compartilhado por todas as requisições pendentes, e cada uma é repetida **uma vez**.
- **Refresh:** `POST {GLOBOID_BASE_URL}/v2/refresh-token` com `{ client_id, globo_id, tokens: [...] }`; os tokens novos vêm em `results[].tokens`. O `globo_id` vem dos claims do JWT.
- **Logout automático** quando o refresh é impossível ou recusado (4xx). Erros de rede e 5xx **não** deslogam.
- **`optionalAuth: true`** marca rotas em que o 401 não significa sessão expirada (recursos PRO).

### Notificações — `hooks/useMarketCloseReminders.ts`

Lembretes locais 24h, 2h e 30min antes do fechamento (ids `market-close-{rodada}-{offset}`). São reagendados quando o prazo ou o time salvo mudam, cancelados com o mercado fechado e controlados pelo toggle no Perfil. A permissão é pedida na primeira abertura.

### Compartilhamento — `hooks/useShareImage.ts`

- **Como funciona:** o card da imagem é montado fora da tela só no toque, capturado com `react-native-view-shot` e enviado ao `expo-sharing`.
- **Liga:** os escudos são pré-carregados antes da captura (até 2,5 s). A imagem leva todos os times da lista, com limite de 100 por memória.
- **Escalação:** usa a escalação da tela, mesmo antes de salvar.

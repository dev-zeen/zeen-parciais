# Parciais FC — contexto para agentes

App Expo/React Native companheiro do Cartola FC: parciais ao vivo, escalação, mercado e ligas.
Expo SDK 58 · RN 0.88 · React 19 · TS 6 · Expo Router · TanStack Query 5 · Zustand 4.

- **Idioma:** responda, comente o código e escreva textos de UI em **português do Brasil**.
- **Regras de negócio** (pontuação, capitão, reservas, ligas, polling, auth): leia
  `docs/funcionalidades-e-regras.md` **antes** de mexer em cálculo, autenticação ou dados. Não as deduza do código.
- **Status do roadmap:** `docs/plano-melhorias.md`.

## Comandos

- `npm run check`: typecheck + lint + testes unitários. **Precisa passar antes de concluir qualquer tarefa.**
- `npm run test:unit`: testes de `utils/__tests__` (Node, sem o preset).
- **Não use** `npm test` / `jest-expo`: o preset está quebrado (`expo-modules-core` aninhado em `expo/`).
- **Nada roda no aparelho daqui.** Diga ao usuário o que validar manualmente.

## Onde fica cada coisa

| Precisa de | Vá em |
| --- | --- |
| Tela / rota | `app/(tabs)/<aba>/` (index=Início, team (+market), rodada, leagues, profile) |
| Chamada de API | `queries/<recurso>.query.ts` (endpoints em `constants/Endpoits.ts`) |
| Regra pura / cálculo | `utils/*.ts`, testado em `utils/__tests__` |
| Estado de tela compartilhado | `store/` (Zustand; preferências com `persist`) |
| Componente de área | `components/contexts/<área>/` |
| Primitivo de UI | `components/ui/` (AppText, Card, Chip, Badge, StateView, AppAlert) |
| Auth / refresh | `lib/core/auth.ts`, `services/api.ts`, `utils/globoid.ts` |
| Status do mercado / `allowRequest` | `hooks/useMarketStatus.ts` |

## Convenções do projeto

- **UI:**
  - Cores, espaçamento e raio vêm de `useTokens()` (`styles/tokens.ts`). Não fixe hex nem crie paletas.
  - Texto com `<AppText variant weight color>`; alertas com `appAlert()`, nunca `Alert` nativo.
  - Telas antigas usam NativeWind e `Themed`; não migre telas fora do escopo.
- **Dados:**
  - Só React Query para dados remotos; sem `useEffect` + `fetch`. Consultas autenticadas usam `enabled: allowRequest`.
  - `select` deve ser puro e estável (fora do componente). Efeito colateral vai no `queryFn`.
- **Lógica:** cálculo novo vai em `utils/` como função pura, com teste. Componentes só montam a UI.
- **Listas:** FlatList/FlashList com `keyExtractor`, `renderItem` em `useCallback` e `extraData` quando o item depende de estado externo.
- **Bibliotecas:** não adicione dependência para problema simples. Módulo nativo novo exige build novo; avise o usuário.
- **RN 0.88:** ref de View é `useRef<ComponentRef<typeof View>>`. `RefreshControl.onRefresh` não pode retornar Promise (`() => { refetch(); }`).
- **Hooks (lint):** não leia `ref.current` durante o render; use `useState(() => valor)` para objetos estáveis (`Animated.Value`). Não chame `setState` síncrono em effect; derive o valor.
- **Fins de linha:** sempre LF (`.gitattributes`). Um hook formata e passa o lint em cada arquivo editado; corrija os erros que ele apontar.

## Princípios (resumo do roteiro de review)

1. A solução mais simples que resolva corretamente. Menos código, menos estado, menos effects.
2. Não refatore fora do escopo, não troque código correto por preferência, não remova funcionalidade.
3. Não crie abstração, hook, context ou componente genérico sem uso real e repetido.
4. Memoize só com motivo (lista, prop de componente memoizado, cálculo caro).
5. Trate loading, erro e vazio; previna toque duplo; mantenha a área de toque com no mínimo `minTouch`.

O roteiro completo de **code review** (severidades e formato de resposta) está na skill
`code-review-rn` (`.claude/skills/code-review-rn/SKILL.md`). Use-a quando pedirem uma revisão.

## Segurança

- Nunca registre nem exiba tokens, cookies ou claims do usuário. `debugLog` existe só em dev.
- `.env`, `credentials.json` e `expo-play-submit.json` estão no `.gitignore`; não os leia nem os cite sem necessidade.

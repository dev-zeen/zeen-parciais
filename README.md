<div align="center">
  <img src="assets/images/icon.png" alt="Parciais FC" width="160"/>

# Zeen Parciais FC

**Parciais ao vivo e ferramentas de decisão para o Cartola FC**

![Version](https://img.shields.io/badge/version-0.7.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo%20SDK-58-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

</div>

---

## Sobre

App iOS e Android para cartoleiros: acompanhar a rodada ao vivo, escalar melhor e
disputar ligas com os amigos. Ele usa a API do Cartola FC com a conta Globo do usuário.

As regras de negócio (pontuação, capitão, reservas, ligas, polling, autenticação) estão em
**[docs/funcionalidades-e-regras.md](docs/funcionalidades-e-regras.md)**.

## Funcionalidades

### Rodada ao vivo

- Parciais do seu time e dos jogadores, atualizadas a cada 30 s com o mercado fechado.
- Classificação da liga recalculada ao vivo, com ▲▼ de posições ganhas na rodada.
- Diferenciais contra um rival: jogadores exclusivos de cada um e o peso dos capitães.

### Escalação

- Campinho interativo com 7 formações, capitão (×1,5) e banco de reservas.
- **Raio-X da escalação:** projeção de pontos, mando, quantos titulares devem valorizar, capitão sugerido e jogadores em risco com atalho para "Trocar".
- Alertas na home: mercado fechando, time sem capitão, titular sem jogo e jogador em dúvida.
- **Lembretes no celular** 24h, 2h e 30min antes do fechamento do mercado.

### Mercado

- Filtros por status, clube, preço, saldo e média; busca sem acento.
- Mínimo para valorizar, confronto da rodada e % de escalação.
- Comparar dois jogadores lado a lado (segurar o card).

### Planejamento

- Calendário de dificuldade dos confrontos nas próximas 5 rodadas (aba Rodada).
- Histórico da temporada no perfil: gráfico, melhor e pior rodada.

### Ligas

- Clássicas, mata-mata e pontos corridos: criação, convites, pedidos e administração.
- Tela do adversário com temporada, confronto direto e escalação por rodada.

### Compartilhar

- Escalação atual como imagem (aba Time).
- Qualquer liga como imagem: classificação, chaves do mata-mata ou tabela de pontos corridos, em qualquer status.

### Geral

- Tema claro, escuro ou automático.
- Atualização pausada em segundo plano para economizar bateria e dados.

## Tecnologias

| Área             | Bibliotecas                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Base             | Expo SDK 58, React Native 0.88, React 19, TypeScript 6, Expo Router (rotas por arquivo, abas nativas)                |
| Dados            | TanStack Query 5, Zustand 4 (com `persist`), Axios, AsyncStorage, Zod (variáveis de ambiente)                        |
| UI               | Design tokens próprios (`styles/tokens.ts`, `useTokens`), NativeWind 2 em telas antigas, FlashList, react-native-svg |
| Recursos nativos | expo-notifications, expo-sharing, react-native-view-shot, expo-haptics, react-native-webview (login)                 |
| Qualidade        | ESLint 9, Prettier, Jest (testes das funções puras)                                                                  |

## Como rodar

**Pré-requisitos:** Node 20+, Xcode (iOS) ou Android Studio (Android). O app usa **dev client** e não roda no Expo Go, porque tem módulos nativos.

```bash
npm install
cp .env.example .env      # preencha as variáveis abaixo
npm run ios               # ou: npm run android
```

| Variável                                      | Uso                                                                |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `EXPO_PUBLIC_API_URL`                         | API do Cartola                                                     |
| `EXPO_PUBLIC_AUTH_URL`                        | Página de login do Cartola (também define a origem dos cabeçalhos) |
| `EXPO_PUBLIC_GLOBOID_BASE_URL`                | API do GloboID (refresh de sessão)                                 |
| `EXPO_PUBLIC_GLOBOID_CLIENT_ID`               | `client_id` do GloboID                                             |
| `EXPO_PUBLIC_GLOBOID_TOKEN_KEY_LOCAL_STORAGE` | Chave dos tokens no `localStorage` da página de login              |

As variáveis são validadas na inicialização (`lib/env.ts`). Se faltar alguma, o app não abre.

## Scripts

| Comando                           | O que faz                                                        |
| --------------------------------- | ---------------------------------------------------------------- |
| `npm start`                       | Metro com cache limpo                                            |
| `npm run ios` / `npm run android` | Build e execução no simulador ou aparelho                        |
| `npm run check`                   | **Typecheck + lint + testes unitários** (rode antes de abrir PR) |
| `npm run typecheck`               | `tsc --noEmit`                                                   |
| `npm run lint`                    | ESLint                                                           |
| `npm run test:unit`               | Testes das funções puras em `utils/__tests__`                    |
| `npm run rebuild`                 | `expo prebuild --clean` (depois de adicionar módulo nativo)      |
| `npm run build:prod:all`          | Build de produção (EAS)                                          |
| `npm run update:prod "mensagem"`  | Update OTA (só para mudanças em JS)                              |

> **Módulo nativo novo exige build novo.** Um update OTA não leva bibliotecas nativas. A versão 0.7 adicionou `expo-notifications`, `expo-sharing` e `react-native-view-shot`.

## Estrutura

```text
app/                 Rotas (Expo Router)
  (tabs)/            index (Início), team (+ market), rodada, leagues, profile
  _providers.tsx     QueryClient, foco do app, tema, auth
components/
  ui/                Primitivos: AppText, Card, Chip, Badge, StateView, AppAlert...
  structure/         Layout: ScreenHeader, BottomSheet, LoadingScreen, Login...
  contexts/<área>/   Componentes de cada área (home, team, market, leagues, matches)
hooks/               Hooks de tela e de domínio (useMarketStatus, usePlayerInsights...)
queries/             Hooks do React Query, um arquivo por recurso da API
utils/               Regras puras e testadas (insights, partials, rivals, fixtures, globoid...)
store/               Zustand: escalação em edição, preferências
lib/                 Auth (GloboID), lembretes, env
services/api.ts      Axios: token, refresh com fila, logs em dev
models/              Tipos da API
docs/                Regras do app e plano de melhorias
```

## Documentação

- [Funcionalidades e regras](docs/funcionalidades-e-regras.md): regras de negócio e técnicas.
- [Plano de melhorias](docs/plano-melhorias.md): o que foi e o que não foi implementado.
- [CLAUDE.md](CLAUDE.md): contexto para agentes de IA.

## Problemas comuns

| Sintoma                                     | Solução                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| App fecha ao abrir com "[env] Variáveis..." | Preencha o `.env` (veja `.env.example`)                           |
| Erro de módulo nativo após `npm install`    | `npm run rebuild` e rode de novo                                  |
| Deslogado com frequência                    | Confira o refresh em `lib/core/auth.ts` (usa `/v2/refresh-token`) |
| `npm test` falha em `expo-modules-core`     | Problema conhecido do preset `jest-expo`; use `npm run test:unit` |
| Metro com comportamento estranho            | `npm start` (já limpa o cache)                                    |

---

Projeto privado. Autor: [Clizio Guedes](https://github.com/clizioguedes).

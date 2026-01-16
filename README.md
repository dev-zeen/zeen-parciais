<div align="center">
  <img src="assets/images/icon.png" alt="Parciais Logo" width="200"/>

# Parciais

  **Acompanhamento em tempo real do Cartola FC com interface moderna e intuitiva**

  [![Version](https://img.shields.io/badge/version-0.6.8-blue.svg)](https://github.com/clizioguedes/parciais)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-54.0.0-000020.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178c6.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-Private-red.svg)]()

  [Sobre](#-sobre) •
  [Funcionalidades](#-funcionalidades) •
  [Tecnologias](#-tecnologias) •
  [Instalação](#-instalação) •
  [Uso](#-uso) •
  [Estrutura](#-estrutura-do-projeto) •
  [Contribuindo](#-contribuindo)
</div>

---

## 📖 Sobre

**App Parciais** é uma aplicação mobile multiplataforma (iOS e Android) desenvolvida para cartoleiros que desejam acompanhar o desempenho de seus times no Cartola FC em tempo real. Com uma interface moderna e intuitiva, a aplicação oferece informações detalhadas sobre parciais de jogadores, estatísticas, mercado, ligas e muito mais.

### 🎯 Diferenciais

- ⚡ **Tempo Real**: Acompanhe as parciais dos seus jogadores ao vivo durante as rodadas
- 🌗 **Tema Dark/Light**: Interface adaptável com modo escuro e claro automático
- 📊 **Estatísticas Detalhadas**: Análises profundas de desempenho com gráficos e métricas
- 🏆 **Gestão de Ligas**: Gerencie ligas clássicas, mata-mata e competições por pontos
- 💰 **Mercado Inteligente**: Filtros avançados para encontrar os melhores jogadores
- 📱 **Interface Moderna**: Design clean e responsivo com animações fluidas
- 🔔 **Notificações**: Alertas sobre status do mercado, convites e jogadores improváveis

---

## ✨ Funcionalidades

### 🏠 Dashboard Principal

- Status do mercado em tempo real (aberto/fechado/manutenção)
- Resumo do seu time com patrimônio e pontuação
- Ações rápidas (escalar time, mercado, ligas, partidas)
- Estatísticas gerais com gráficos de desempenho
- Destaque do capitão com multiplicador de pontos
- Alertas sobre jogadores improváveis e lesionados
- Carrossel de destaques com melhores jogadores da rodada

### ⚽ Escalação de Time

- Campo visual interativo com formações táticas (3-4-3, 4-3-3, 4-4-2, 4-5-1, 5-3-2, 5-4-1)
- Seleção e troca de capitão com multiplicador de pontos
- Gerenciamento de jogadores titulares e reservas
- Indicadores de status (provável, dúvida, contundido, nulo, suspenso)
- Sistema de confirmação ao trocar formações
- Estatísticas individuais dos jogadores
- Validação de cartoletas e patrimônio

### 💼 Mercado

- Listagem completa de jogadores disponíveis
- Filtros avançados:
  - Por time (clubes da Série A)
  - Por posição (Goleiro, Lateral, Zagueiro, Meia, Atacante, Técnico)
  - Por status (Provável, Dúvida, Contundido, etc.)
  - Ordenação (Pontuação, Preço, Valorização, Média, Scouts)
- Cards com informações detalhadas:
  - Foto, nome, posição, clube
  - Preço, média de pontos, última pontuação
  - Mínima valorização, próximo jogo
  - Scouts detalhados (quando disponível)
- Destaque de jogadores mais baratos por posição
- Compra e venda integrada

### 🏆 Ligas

- Visualização de todas as suas ligas
- Suporte para 3 tipos de ligas:
  - **Clássicas**: Ranking simples por pontuação
  - **Mata-Mata**: Eliminatórias diretas
  - **Pontos Corridos**: Campeonato de pontos acumulados
- Detalhes de cada liga:
  - Classificação completa
  - Estatísticas dos times adversários
  - Histórico de rodadas
- Sistema de convites:
  - Receber e aceitar convites
  - Enviar convites para outros cartoleiros
  - Notificações de convites pendentes

### 📊 Visualização de Clubes

- Seletor de rodadas para análise histórica
- Escalação do time adversário
- Comparação de estatísticas:
  - Patrimônio
  - Pontuação da rodada
  - Pontos totais
  - Média de pontos
- Informações do cartoleiro

### ⚽ Partidas

- Calendário completo de rodadas
- Informações de cada partida:
  - Times, placar, data e horário
  - Local do jogo
  - Status (agendada, ao vivo, encerrada)
- Detalhes expandidos por partida:
  - Escalação dos times reais
  - Estatísticas dos jogadores
  - Scouts ao vivo

### 👤 Perfil

- Informações do cartoleiro:
  - Nome, time, foto, escudo
  - Status PRO/Free
  - Tempo de Cartola
- Estatísticas gerais:
  - Total de pontos e patrimônio
  - Média de pontos e consistência
  - Melhor e pior rodada
- Rankings:
  - Posição no Brasil
  - Variação de posição
  - Posição no estado e clube do coração
- Performance por rodada (gráfico de linha)
- Participação em ligas:
  - Quantidade de ligas ativas
  - Convites pendentes
- Informações adicionais:
  - Escudo e camisa personalizados
  - Assinatura PRO
- Configurações:
  - Seleção de tema (Claro/Escuro/Automático)
  - Logout

---

## 🛠 Tecnologias

### Core

- **[React Native](https://reactnative.dev/)** `0.81.5` - Framework mobile
- **[Expo](https://expo.dev/)** `54.0.0` - Plataforma de desenvolvimento
- **[TypeScript](https://www.typescriptlang.org/)** `5.1.3` - Tipagem estática
- **[Expo Router](https://expo.github.io/router/)** `6.0.0` - Roteamento file-based

### UI/UX

- **[NativeWind](https://www.nativewind.dev/)** `2.0.11` - TailwindCSS para React Native
- **[Nunito Font](https://fonts.google.com/specimen/Nunito)** - Fonte principal da aplicação
- **[@expo/vector-icons](https://icons.expo.fyi/)** `15.0.3` - Biblioteca de ícones
- **[react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)** - Gráficos e visualizações
- **[react-native-svg](https://github.com/software-mansion/react-native-svg)** - Suporte a SVG

### Estado e Dados

- **[@tanstack/react-query](https://tanstack.com/query)** `4.32.0` - Gerenciamento de estado assíncrono
- **[Zustand](https://github.com/pmndrs/zustand)** `4.3.9` - Estado global
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Persistência local
- **[Axios](https://axios-http.com/)** `1.4.0` - Cliente HTTP

### Navegação e Layout

- **[@react-navigation/native](https://reactnavigation.org/)** `7.1.8` - Navegação
- **[react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)** - Safe areas
- **[react-native-screens](https://github.com/software-mansion/react-native-screens)** - Otimização de telas
- **[@shopify/flash-list](https://shopify.github.io/flash-list/)** - Listas de alta performance

### Utilitários

- **[date-fns](https://date-fns.org/)** `2.30.0` - Manipulação de datas
- **[react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)** - Gestos
- **[react-native-error-boundary](https://github.com/carloscuesta/react-native-error-boundary)** - Error boundaries
- **[@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo)** - Status de rede

### Qualidade de Código

- **[ESLint](https://eslint.org/)** - Linter
- **[Prettier](https://prettier.io/)** - Formatador de código
- **[Jest](https://jestjs.io/)** - Framework de testes
- **Configurações Airbnb** - Padrões de código

---

## 📦 Instalação

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **[Node.js](https://nodejs.org/)** (versão 18 ou superior)
- **[Yarn](https://yarnpkg.com/)** ou **[npm](https://www.npmjs.com/)**
- **[Expo CLI](https://docs.expo.dev/get-started/installation/)**
- **[Git](https://git-scm.com/)**

Para desenvolvimento mobile:

- **[Android Studio](https://developer.android.com/studio)** (para Android)
- **[Xcode](https://developer.apple.com/xcode/)** (para iOS - apenas macOS)

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/clizioguedes/parciais.git
cd parciais
```

1. **Instale as dependências**

```bash
# Com Yarn (recomendado)
yarn install

# Ou com npm
npm install
```

1. **Inicie o projeto**

```bash
# Modo desenvolvimento
yarn start

# Ou
npm start
```

1. **Execute no dispositivo/emulador**

```bash
# Android
yarn android

# iOS (macOS only)
yarn ios

# Web
yarn web
```

---

## 🚀 Uso

### Scripts Disponíveis

```bash
# Desenvolvimento
yarn start              # Inicia o Expo Dev Server
yarn android           # Executa no Android
yarn ios               # Executa no iOS
yarn web               # Executa no navegador

# Qualidade de Código
yarn lint              # Executa o ESLint
yarn test              # Executa os testes

# Build
yarn rebuild           # Rebuild completo do projeto
yarn rebuild-test      # Rebuild + teste no iOS

# Utilitários
yarn generate-assets   # Gera assets do app
yarn generate-splash   # Gera splash screen
```

### Autenticação

A aplicação utiliza autenticação via **Globo ID**:

1. Ao abrir o app, clique em "Entrar com Globo ID"
2. Você será redirecionado para o login oficial do Cartola FC
3. Após autenticar, você será redirecionado de volta ao app
4. O token de acesso é armazenado de forma segura

### Primeiros Passos

1. **Visualize seu dashboard** com estatísticas gerais
2. **Escale seu time** na aba "Time"
3. **Explore o mercado** para comprar/vender jogadores
4. **Participe de ligas** e convide amigos
5. **Acompanhe as partidas** e parciais em tempo real
6. **Personalize seu perfil** e escolha seu tema favorito

---

## 📁 Estrutura do Projeto

```
parciais/
├── app/                          # Screens e rotas (Expo Router)
│   ├── (tabs)/                  # Navegação por tabs
│   │   ├── index.tsx           # 🏠 Home/Dashboard
│   │   ├── team/               # ⚽ Escalação de time
│   │   ├── matches/            # 🏆 Partidas
│   │   ├── leagues/            # 🏆 Ligas
│   │   │   ├── create/        # Criar liga
│   │   │   ├── invites/       # Convites
│   │   │   ├── club/          # Detalhes do clube
│   │   │   └── league/        # Detalhes da liga
│   │   ├── players/            # 👥 Jogadores
│   │   └── profile/            # 👤 Perfil
│   ├── _layout.tsx             # Layout raiz
│   └── _providers.tsx          # Providers globais
│
├── components/                  # Componentes reutilizáveis
│   ├── contexts/               # Componentes específicos de contexto
│   │   ├── home/              # Dashboard
│   │   ├── team/              # Time
│   │   ├── market/            # Mercado
│   │   ├── leagues/           # Ligas
│   │   ├── matches/           # Partidas
│   │   ├── players/           # Jogadores
│   │   └── utils/             # Utilitários
│   ├── structure/              # Componentes estruturais
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Loading.tsx
│   │   ├── Tabs.tsx
│   │   └── ...
│   ├── charts/                 # Componentes de gráficos
│   └── Themed.tsx              # Componentes com tema
│
├── contexts/                    # Contextos React
│   ├── Auth.context.tsx        # Autenticação
│   └── Theme.context.tsx       # Tema (Dark/Light)
│
├── hooks/                       # Custom Hooks
│   ├── useThemeColor.ts        # Hook de tema
│   ├── useMarketStatus.ts      # Status do mercado
│   ├── useMyClub.ts            # Dados do clube
│   ├── useInvites.ts           # Convites de ligas
│   └── ...
│
├── queries/                     # React Query hooks
│   ├── club.query.ts           # Queries de clubes
│   ├── leagues.query.ts        # Queries de ligas
│   ├── market.query.ts         # Queries do mercado
│   ├── matches.query.ts        # Queries de partidas
│   ├── players.query.ts        # Queries de jogadores
│   └── stats.query.ts          # Queries de estatísticas
│
├── models/                      # TypeScript types/interfaces
│   ├── Club.ts
│   ├── Competition.ts
│   ├── Leagues.ts
│   ├── Market.ts
│   ├── Matches.ts
│   ├── Player.ts
│   └── Stats.ts
│
├── services/                    # Serviços externos
│   └── api.ts                  # Cliente Axios configurado
│
├── constants/                   # Constantes da aplicação
│   ├── Colors.ts               # Paleta de cores
│   ├── Formations.ts           # Formações táticas
│   ├── Market.ts               # Constantes do mercado
│   └── ...
│
├── utils/                       # Funções utilitárias
│   ├── format.ts               # Formatação de dados
│   ├── parseTo.ts              # Conversões
│   ├── asyncStorage.ts         # Helpers de storage
│   └── ...
│
├── store/                       # Zustand stores
│   └── useTeamLineupStore.ts  # Estado da escalação
│
├── styles/                      # Estilos e temas
│   ├── colors.ts
│   └── theme/
│       └── index.ts
│
├── assets/                      # Assets estáticos
│   ├── images/                 # Imagens
│   └── fonts/                  # Fontes customizadas
│
├── lib/                         # Bibliotecas auxiliares
│   └── core/
│       └── auth.ts             # Autenticação
│
├── docs/                        # Documentação
│
├── app.json                     # Configuração Expo
├── package.json                 # Dependências
├── tsconfig.json               # Configuração TypeScript
├── tailwind.config.js          # Configuração Tailwind
├── babel.config.js             # Configuração Babel
└── README.md                    # Este arquivo
```

---

## 🎨 Sistema de Temas

A aplicação possui um sistema completo de temas com suporte a modo claro, escuro e automático.

### Configuração de Tema

```typescript
// contexts/Theme.context.tsx
type ThemeMode = 'light' | 'dark' | 'auto';
```

### Uso do Hook de Tema

```typescript
import { useThemeColor } from '@/hooks/useThemeColor';

function MyComponent() {
  const colorTheme = useThemeColor();

  return (
    <View style={{
      backgroundColor: colorTheme === 'dark' ? '#1F2937' : '#FFFFFF'
    }}>
      <Text>Conteúdo adaptável ao tema</Text>
    </View>
  );
}
```

### Classes Tailwind com Dark Mode

```tsx
<Text className="text-gray-900 dark:text-gray-100">
  Texto adaptável
</Text>

<View className="bg-white dark:bg-gray-800 rounded-lg p-4">
  Card com tema
</View>
```

---

## 🎯 Roadmap

### Em Desenvolvimento

- [ ] Notificações push para eventos importantes
- [ ] Sistema de favoritos de jogadores
- [ ] Comparação entre times de uma liga
- [ ] Histórico detalhado de transações
- [ ] Simulador de escalações

### Planejado

- [ ] Widget para tela inicial (iOS/Android)
- [ ] Apple Watch / WearOS support
- [ ] Modo offline com cache
- [ ] Compartilhamento de escalações
- [ ] Integração com redes sociais
- [ ] Análise de scouts com IA

---

## 🐛 Resolução de Problemas

### Erro ao instalar dependências

```bash
# Limpe o cache e reinstale
rm -rf node_modules yarn.lock
yarn install
```

### Erro ao executar no iOS

```bash
# Reinstale pods
cd ios
pod install
cd ..
yarn ios
```

### Erro de autenticação

1. Limpe o cache do AsyncStorage
2. Faça logout e login novamente
3. Verifique sua conexão com a internet

### Metro Bundler não inicia

```bash
# Limpe o cache do Metro
yarn start --clear
```

---

## 📄 Licença

Este projeto é privado e não possui licença pública. Todos os direitos reservados.

---

## 👨‍💻 Autor

**Clizio Guedes**

- GitHub: [@clizioguedes](https://github.com/clizioguedes)
- LinkedIn: [Clizio Guedes](https://www.linkedin.com/in/clizioguedes/)

---

## 🙏 Agradecimentos

- [Cartola FC](https://cartolafc.globo.com/) pela API oficial
- [Expo Team](https://expo.dev/) pela excelente plataforma
- [React Native Community](https://reactnative.dev/) pelo framework
- Todos os contribuidores e testadores

---

<div align="center">

  **Desenvolvido com ❤️ para cartoleiros apaixonados**

  ⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>

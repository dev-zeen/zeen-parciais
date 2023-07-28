interface IStatusMarketPlayer {
  name: string;
  id: number;
  icon: string;
  color: string;
  background?: string;
}

type STATUS_MARKET_PLAYER = {
  [key: number]: IStatusMarketPlayer;
};

export const OBJECT_STATUS_MARKET_PLAYER: STATUS_MARKET_PLAYER = {
  2: {
    name: "Dúvida",
    id: 2,
    icon: "help-circle",
    color: "white",
    background: "#fb923c",
  },
  3: {
    name: "Suspenso",
    id: 3,
    icon: "clipboard",
    color: "#f87171",
    background: "white",
  },
  5: {
    name: "Contundido",
    id: 5,
    icon: "x",
    color: "white",
    background: "#f87171",
  },
  6: {
    name: "Nulo",
    id: 6,
    icon: "minus",
    color: "white",
    background: "#f87171",
  },
  7: {
    name: "Provável",
    id: 7,
    icon: "check",
    color: "white",
    background: "#22c55e",
  },
};

export enum ENUM_STATUS_MARKET_PLAYER {
  DUVIDA = 2,
  SUSPENSO = 3,
  CONTUNDIDO = 5,
  NULO = 6,
  PROVAVEL = 7,
}

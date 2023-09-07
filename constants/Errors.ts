type StatusErrorMessagesProps = {
  [key: number]: {
    message: string;
    code: number;
    buttonText: string;
  };
};

export const StatusErrorMessages: StatusErrorMessagesProps = {
  401: {
    message: 'Entre na sua conta Globo para acessar seus dados.',
    code: 401,
    buttonText: 'Voltar',
  },
  404: {
    message: 'Página não encontrada.',
    code: 404,
    buttonText: 'Tente Novamente',
  },
  500: {
    message: 'O Servidor está com instabilidade, tente novamente mais tarde.',
    code: 503,
    buttonText: 'Tente Novamente',
  },
  503: {
    message: 'Mercado em Manutenção.',
    code: 503,
    buttonText: 'Atualizar',
  },
  1: {
    message: 'Erro Inesperado, já estamos trabalhando para resolver.',
    code: 1,
    buttonText: 'Atualizar',
  },
};

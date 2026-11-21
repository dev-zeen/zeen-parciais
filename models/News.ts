/** Notícia ou dica (GET /auth/noticias e /auth/noticias/gatomestre) */
export interface NewsItem {
  titulo: string;
  subtitulo?: string;
  url: string;
  thumbnail?: string;
  pubeditorial?: boolean;
}

export type NewsSource = 'cartola' | 'gatomestre';

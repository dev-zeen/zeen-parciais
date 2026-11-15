/**
 * Fonte única de cores, espaçamentos e tipografia do app.
 * Sem imports de react-native para poder ser lido pelo script de contraste
 * (scripts/check-contrast.mjs).
 */

export type ThemeName = 'light' | 'dark';

export type Palette = {
  /** Fundo da tela */
  bg: string;
  /** Cards e sheets */
  surface: string;
  /** Chips, campos e áreas rebaixadas */
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  /** Laranja da marca, usado como preenchimento */
  brand: string;
  /** Texto sobre `brand` */
  onBrand: string;
  /** Laranja legível como texto */
  brandText: string;
  /** Preenchimento suave da marca (ex.: indicador de aba) */
  brandContainer: string;
  /** Ações e links, legível como texto */
  accent: string;
  /** Preenchimento de botões de ação */
  accentFill: string;
  onAccentFill: string;
  accentContainer: string;
  /** Verde legível como texto */
  positive: string;
  positiveFill: string;
  onPositiveFill: string;
  positiveContainer: string;
  negative: string;
  negativeFill: string;
  onNegativeFill: string;
  negativeContainer: string;
  warning: string;
  warningFill: string;
  onWarningFill: string;
  warningContainer: string;
  /** Botão desabilitado */
  disabledFill: string;
  onDisabledFill: string;
  overlay: string;
};

export const palette: Record<ThemeName, Palette> = {
  light: {
    bg: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceAlt: '#ECEEF1',
    border: '#E5E7EB',
    text: '#111111',
    textMuted: '#565E6A',
    brand: '#FF8A00',
    onBrand: '#1A1200',
    brandText: '#964B00',
    brandContainer: '#FFE3C2',
    accent: '#0050EB',
    accentFill: '#0057FF',
    onAccentFill: '#FFFFFF',
    accentContainer: '#DDEAFF',
    positive: '#00704A',
    positiveFill: '#00E094',
    onPositiveFill: '#00301F',
    positiveContainer: '#D3F8EA',
    negative: '#B3261E',
    negativeFill: '#C62828',
    onNegativeFill: '#FFFFFF',
    negativeContainer: '#FDE2E0',
    warning: '#875000',
    warningFill: '#FBBF24',
    onWarningFill: '#2B1D00',
    warningContainer: '#FFEDC7',
    disabledFill: '#D7DAE0',
    onDisabledFill: '#565E6A',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    bg: '#0D1117',
    surface: '#161B22',
    surfaceAlt: '#21262D',
    border: '#30363D',
    text: '#F5F5F5',
    textMuted: '#9CA3AF',
    brand: '#FF8A00',
    onBrand: '#1A1200',
    brandText: '#FFA940',
    brandContainer: '#4A2B00',
    accent: '#7AA5FF',
    accentFill: '#5B8EFF',
    onAccentFill: '#0D1117',
    accentContainer: '#12264D',
    positive: '#00E094',
    positiveFill: '#00E094',
    onPositiveFill: '#00301F',
    positiveContainer: '#0B3B2B',
    negative: '#F87171',
    negativeFill: '#F87171',
    onNegativeFill: '#2B0707',
    negativeContainer: '#4A1414',
    warning: '#FBBF24',
    warningFill: '#FBBF24',
    onWarningFill: '#2B1D00',
    warningContainer: '#453200',
    disabledFill: '#30363D',
    onDisabledFill: '#9CA3AF',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

/** Cores do campinho, iguais nos dois temas porque ficam sobre o gramado. */
export const field = {
  chipBg: '#FFFFFF',
  chipText: '#111111',
  chipBorder: '#D7DAE0',
  slotBg: 'rgba(255, 255, 255, 0.92)',
  slotBorder: '#FFFFFF',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const fontFamily = 'Satoshi-Variable';

export const fontSize = {
  caption: 11,
  label: 12,
  body: 14,
  title: 16,
  heading: 20,
  display: 28,
} as const;

export const lineHeight = {
  caption: 14,
  label: 16,
  body: 20,
  title: 22,
  heading: 26,
  display: 34,
} as const;

export const motion = {
  press: 150,
  enter: 250,
} as const;

/**
 * Pares texto/fundo que precisam de contraste AA.
 * [texto, fundo, mínimo]
 */
export const contrastPairs: [keyof Palette, keyof Palette, number][] = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'surfaceAlt', 4.5],
  ['textMuted', 'bg', 4.5],
  ['textMuted', 'surface', 4.5],
  ['textMuted', 'surfaceAlt', 4.5],
  ['brandText', 'bg', 4.5],
  ['brandText', 'surface', 4.5],
  ['accent', 'bg', 4.5],
  ['accent', 'surface', 4.5],
  ['accent', 'surfaceAlt', 4.5],
  ['positive', 'bg', 4.5],
  ['positive', 'surface', 4.5],
  ['negative', 'bg', 4.5],
  ['negative', 'surface', 4.5],
  ['warning', 'bg', 4.5],
  ['warning', 'surface', 4.5],
  ['onBrand', 'brand', 4.5],
  ['text', 'brandContainer', 4.5],
  ['onAccentFill', 'accentFill', 4.5],
  ['accent', 'accentContainer', 4.5],
  ['onPositiveFill', 'positiveFill', 4.5],
  ['positive', 'positiveContainer', 4.5],
  ['onNegativeFill', 'negativeFill', 4.5],
  ['negative', 'negativeContainer', 4.5],
  ['onWarningFill', 'warningFill', 4.5],
  ['warning', 'warningContainer', 4.5],
  ['onDisabledFill', 'disabledFill', 3],
];

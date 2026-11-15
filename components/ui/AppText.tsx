import { Text, TextProps } from 'react-native';

import { useTokens } from '@/hooks/useTokens';
import { Palette, fontFamily, fontSize, lineHeight } from '@/styles/tokens';

export type AppTextVariant = keyof typeof fontSize;

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  /** Token de cor ou cor literal (ex.: cores do campinho) */
  color?: keyof Palette | (string & {});
  weight?: 'regular' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
};

const WEIGHTS = { regular: '400', medium: '500', bold: '700' } as const;

export function AppText({
  variant = 'body',
  color = 'text',
  weight = 'regular',
  align,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useTokens();
  const resolvedColor = color in colors ? colors[color as keyof Palette] : color;

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily,
          fontSize: fontSize[variant],
          lineHeight: lineHeight[variant],
          fontWeight: WEIGHTS[weight],
          color: resolvedColor,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

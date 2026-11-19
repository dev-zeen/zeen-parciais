import { View, ViewProps } from 'react-native';

import { useTokens } from '@/hooks/useTokens';

type CardProps = ViewProps & {
  /** `alt` usa a superfície rebaixada, para blocos dentro de outro card */
  tone?: 'surface' | 'alt';
  padding?: number;
};

export function Card({ tone = 'surface', padding, style, ...props }: CardProps) {
  const { colors, radius, spacing } = useTokens();

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: tone === 'alt' ? colors.surfaceAlt : colors.surface,
          borderRadius: radius.md,
          padding: padding ?? spacing.sm,
        },
        style,
      ]}
    />
  );
}

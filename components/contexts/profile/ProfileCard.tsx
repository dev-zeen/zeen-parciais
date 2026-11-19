import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { useThemeColor } from '@/hooks/useThemeColor';

type ProfileCardProps = {
  delay: number;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  title: string;
  /** Conteúdo à direita do título (ex.: chevron de navegação) */
  trailing?: ReactNode;
  /** Card inteiro tocável */
  onPress?: () => void;
  children: ReactNode;
};

/** Card do perfil: título com ícone e o conteúdo abaixo. */
export function ProfileCard({
  delay,
  icon,
  iconColor,
  title,
  trailing,
  onPress,
  children,
}: ProfileCardProps) {
  const content = (
    <View style={{ gap: 16, backgroundColor: 'transparent' }}>
      <View
        className={`flex-row items-center${trailing ? ' justify-between' : ''}`}
        style={{ gap: 8, backgroundColor: 'transparent' }}>
        <View className="flex-row items-center" style={{ gap: 8, backgroundColor: 'transparent' }}>
          <Feather name={icon} size={20} color={iconColor} />
          <Text className="text-base font-bold">{title}</Text>
        </View>
        {trailing}
      </View>
      {children}
    </View>
  );

  return (
    <AnimatedCard delay={delay} variant="flat">
      {onPress ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </AnimatedCard>
  );
}

/** Linha de blocos lado a lado dentro de um ProfileCard. */
export function ProfileRow({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
      {children}
    </View>
  );
}

type ProfileStatTileProps = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  iconBackground: string;
  value: ReactNode;
  caption: ReactNode;
  valueColor?: string;
  /** Números longos (rankings): fonte menor que encolhe para caber */
  fit?: boolean;
};

/** Bloco de estatística: rótulo e ícone no topo, valor em destaque e legenda. */
export function ProfileStatTile({
  label,
  icon,
  iconColor,
  iconBackground,
  value,
  caption,
  valueColor,
  fit,
}: ProfileStatTileProps) {
  const colorTheme = useThemeColor();

  return (
    <View
      className="flex-1 rounded-xl p-3"
      style={{ backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6', minHeight: 88 }}>
      <View
        className="flex-row items-center justify-between mb-2"
        style={{ backgroundColor: 'transparent' }}>
        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {label}
        </Text>
        <View
          className="w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: iconBackground }}>
          <Feather name={icon} size={14} color={iconColor} />
        </View>
      </View>
      {fit ? (
        <Text
          className="font-bold mb-1"
          style={{ fontSize: 18, ...(valueColor ? { color: valueColor } : null) }}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.7}>
          {value}
        </Text>
      ) : (
        <Text
          className="font-bold text-xl mb-1"
          style={valueColor ? { color: valueColor } : undefined}
          numberOfLines={1}>
          {value}
        </Text>
      )}
      <Text className="text-xs text-gray-500 dark:text-gray-400">{caption}</Text>
    </View>
  );
}

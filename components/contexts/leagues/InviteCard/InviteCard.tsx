import {  Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { Button } from '@/components/structure/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

type InviteCardProps = {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  teamName?: string;
  onAccept: () => void;
  onDecline: () => void;
};

export function InviteCard({ title, subtitle, imageUrl, teamName, onAccept, onDecline }: InviteCardProps) {
  const colorTheme = useThemeColor();

  return (
    <AnimatedCard variant="flat" className="p-0">
      <View
        className="flex-row items-center"
        style={{
          gap: 12,
          backgroundColor: 'transparent',
        }}>
        {/* Imagem da Liga/Competição */}
        <Image
          source={{
            uri: imageUrl,
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colorTheme === 'dark' ? '#111827' : '#f3f4f6',
          }}
          alt={`Imagem do convite ${title ?? ''}`}
        />

        {/* Informações do Convite */}
        <View style={{ flex: 1, backgroundColor: 'transparent', gap: 4 }}>
          <Text className="text-base font-bold" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {subtitle}
          </Text>
          {teamName && (
            <Text className="text-xs font-medium" style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }} numberOfLines={1}>
              De: {teamName}
            </Text>
          )}
        </View>

        {/* Botões de Ação */}
        <View
          className="flex-row items-center"
          style={{ gap: 8, backgroundColor: 'transparent' }}>
          <Button
            onPress={onDecline}
            variant="error"
            onlyIcon
            hasIcon
            iconName="x"
          />
          <Button
            onPress={onAccept}
            variant="success"
            onlyIcon
            hasIcon
            iconName="check"
          />
        </View>
      </View>
    </AnimatedCard>
  );
}

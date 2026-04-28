import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { useThemeColor } from '@/hooks/useThemeColor';

type ErrorScreenProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorScreen({
  message = 'Algo deu errado. Tente novamente.',
  onRetry,
}: ErrorScreenProps) {
  const colorTheme = useThemeColor();

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        className={`flex-1 items-center justify-center px-8 ${
          colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
        }`}
        style={{ gap: 16 }}>
        <Text
          className="text-base font-medium text-center"
          style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
          {message}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={{
              backgroundColor: '#FF8A00',
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 8,
            }}>
            <Text className="text-sm font-semibold" style={{ color: '#fff' }}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaViewContainer>
  );
}

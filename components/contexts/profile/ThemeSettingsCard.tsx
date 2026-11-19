import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { ProfileCard, ProfileRow } from '@/components/contexts/profile/ProfileCard';
import { useTheme } from '@/contexts/Theme.context';
import { useTokens } from '@/hooks/useTokens';

const OPTIONS = [
  { mode: 'light', label: 'Claro', icon: 'sun' },
  { mode: 'dark', label: 'Escuro', icon: 'moon' },
  { mode: 'auto', label: 'Auto', icon: 'smartphone' },
] as const;

/** Escolha do tema: claro, escuro ou seguindo o sistema. */
export function ThemeSettingsCard() {
  const { colors: tk } = useTokens();
  const { themeMode, colorScheme: colorTheme, setThemeMode } = useTheme();

  return (
    <ProfileCard delay={700} icon="moon" iconColor={tk.accent} title="Tema do Aplicativo">
      <ProfileRow>
        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.mode}
            activeOpacity={0.7}
            onPress={() => setThemeMode(option.mode)}
            className="flex-1 rounded-xl p-3"
            style={{
              backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
              borderWidth: 2,
              borderColor: themeMode === option.mode ? tk.accent : 'transparent',
            }}>
            <View
              className="flex-row items-center justify-between mb-2"
              style={{ backgroundColor: 'transparent' }}>
              <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                {option.label}
              </Text>
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: tk.accentContainer }}>
                <Feather name={option.icon} size={12} color={tk.accent} />
              </View>
            </View>
            {themeMode === option.mode && (
              <View
                className="flex-row items-center"
                style={{ gap: 4, backgroundColor: 'transparent' }}>
                <Feather name="check" size={12} color={tk.accent} />
                <Text className="text-xs font-semibold" style={{ color: tk.accent }}>
                  Ativo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ProfileRow>
      <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {themeMode === 'auto'
          ? 'Segue o tema do sistema automaticamente'
          : `Tema ${themeMode === 'light' ? 'claro' : 'escuro'} sempre ativo`}
      </Text>
    </ProfileCard>
  );
}

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { useThemeColor } from '@/hooks/useThemeColor';

type QuickAction = {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  badge?: string | number;
  color: string;
};

export function QuickActionsGrid() {
  const router = useRouter();
  const colorTheme = useThemeColor();

  const actions: QuickAction[] = [
    {
      id: 'team',
      label: 'Meu Time',
      icon: 'shield',
      route: '/(tabs)/team',
      color: '#8B5CF6',
    },
    {
      id: 'matches',
      label: 'Partidas',
      icon: 'calendar',
      route: '/(tabs)/matches',
      color: '#3B82F6',
    },
    {
      id: 'players',
      label: 'Jogadores',
      icon: 'trending-up',
      route: '/(tabs)/players',
      color: '#22C55E',
    },
    {
      id: 'leagues',
      label: 'Ligas',
      icon: 'bar-chart-2',
      route: '/(tabs)/leagues',
      color: '#F59E0B',
    },
  ];

  return (
    <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
      {actions.map((action, index) => (
        <Pressable
          key={action.id}
          onPress={() => router.push(action.route as any)}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}>
          <AnimatedCard delay={100 + index * 50} variant="flat" style={{ height: 100 }}>
            <View
              className="items-center justify-center h-full"
              style={{ gap: 6, backgroundColor: 'transparent' }}>
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${action.color}25` }}>
                <Feather name={action.icon} size={20} color={action.color} />
              </View>
              <Text
                className="font-semibold text-xs text-center"
                numberOfLines={1}
                style={{ color: colorTheme === 'dark' ? '#F3F4F6' : '#1F2937' }}>
                {action.label}
              </Text>
              {action.badge && (
                <View
                  className="absolute top-1 right-1 w-5 h-5 rounded-full items-center justify-center"
                  style={{ backgroundColor: action.color }}>
                  <Text className="text-white text-xs font-bold">{action.badge}</Text>
                </View>
              )}
            </View>
          </AnimatedCard>
        </Pressable>
      ))}
    </View>
  );
}

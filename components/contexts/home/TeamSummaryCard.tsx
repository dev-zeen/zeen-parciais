import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, Pressable, useColorScheme } from 'react-native';

import proImage from '@/assets/images/pro.png';
import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { FullClubInfo } from '@/models/Club';

type TeamSummaryCardProps = {
  team: FullClubInfo;
};

export function TeamSummaryCard({ team }: TeamSummaryCardProps) {
  const colorTheme = useColorScheme();

  return (
    <Link href="/(tabs)/profile" asChild>
      <Pressable>
        <AnimatedCard delay={200} variant="flat">
          <View className="flex-row items-center justify-between" style={{ backgroundColor: 'transparent' }}>
            <View className="flex-row items-center" style={{ gap: 12, backgroundColor: 'transparent' }}>
              <Image
                source={{ uri: team.time.url_escudo_png }}
                className="w-16 h-16 rounded-xl"
                alt={team.time.nome}
              />
              <View style={{ gap: 4, backgroundColor: 'transparent' }}>
                <View className="flex-row items-center" style={{ gap: 6, backgroundColor: 'transparent' }}>
                  <Text className="font-bold text-lg" numberOfLines={1}>
                    {team.time.nome}
                  </Text>
                  {team.time.assinante && (
                    <Image source={proImage} className="w-7 h-3.5" alt="PRO" />
                  )}
                </View>
                <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                  {team.time.nome_cartola}
                </Text>
              </View>
            </View>
            <Feather 
              name="chevron-right" 
              size={20} 
              color={colorTheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
            />
          </View>
        </AnimatedCard>
      </Pressable>
    </Link>
  );
}

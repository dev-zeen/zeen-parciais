import { Link } from 'expo-router';
import { Image, Pressable } from 'react-native';

import proImage from '@/assets/images/pro.png';
import { Text, View } from '@/components/Themed';
import { FullClubInfo } from '@/models/Club';

type TeamBannerProps = {
  team: FullClubInfo;
};

export function TeamBanner({ team }: TeamBannerProps) {
  return (
    <Link href="/(tabs)/profile" asChild>
      <Pressable>
        <View className="flex-row items-center rounded-lg p-4">
          <Image
            source={{
              uri: team.time.url_escudo_png,
            }}
            className="w-16 h-16"
            alt={`Escudo do ${team.time.nome}`}
          />
          <View className="gap-1 pl-4">
            {team.time.assinante ? (
              <Image source={proImage} className="w-10 h-5" alt="Selo PRO para quem é assinante" />
            ) : (
              <View />
            )}

            <Text className="font-semibold text-sm">{team.time.nome}</Text>
            <Text className="text-xs capitalize">{team.time.nome_cartola}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

import { Image } from "react-native";

import cartolaProImage from "@/assets/images/pro.png";
import { Text, View } from "@/components/Themed";
import { FullClubInfo } from "@/models/Club";

type TeamBannerProps = {
  team: FullClubInfo;
};

export function TeamBanner({ team }: TeamBannerProps) {
  return (
    <View className="flex-1 flex-row items-center rounded-lg p-2">
      <Image
        source={{
          uri: team.time.url_escudo_png,
        }}
        className="w-16 h-16"
        alt={`Escudo do ${team.time.nome}`}
      />
      <View className="gap-1 pl-4">
        {team.time.assinante ? (
          <Image
            source={cartolaProImage}
            className="w-10 h-5"
            alt={`Selo PRO do cartola para quem é assinante`}
          />
        ) : (
          <View />
        )}

        <Text className="font-semibold text-sm">{team.time.nome}</Text>
        <Text className="font-light text-xs capitalize">
          {team.time.nome_cartola}
        </Text>
      </View>
    </View>
  );
}

import { Text, View } from "react-native";

import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { useLocalSearchParams } from "expo-router";

export default () => {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaViewContainer>
      <View className="items-center justify-center flex-1">
        <Text> Página da partida </Text>
      </View>
    </SafeAreaViewContainer>
  );
};

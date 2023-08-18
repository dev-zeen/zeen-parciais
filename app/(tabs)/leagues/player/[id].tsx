import { Redirect, useLocalSearchParams } from "expo-router";

import { Text, View } from "@/components/Themed";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { AuthContext } from "@/contexts/Auth.context";
import { useContext } from "react";

export default () => {
  const { id } = useLocalSearchParams();

  const { isAutheticated } = useContext(AuthContext);

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  return (
    <SafeAreaViewContainer>
      <View className="items-center justify-center flex-1">
        <Text> Página do jogador {id} </Text>
      </View>
    </SafeAreaViewContainer>
  );
};

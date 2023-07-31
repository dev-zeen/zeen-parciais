import { View } from "@/components/Themed";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ActivityIndicator } from "react-native";

type LoadingProps = {};

export function Loading({}: LoadingProps) {
  return (
    <SafeAreaViewContainer>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    </SafeAreaViewContainer>
  );
}

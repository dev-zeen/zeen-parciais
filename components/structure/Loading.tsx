import { ActivityIndicator } from "react-native";

import { View } from "@/components/Themed";

type LoadingProps = {};

export function Loading({}: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator />
    </View>
  );
}

import { View } from "@/components/Themed";
import { ActivityIndicator } from "react-native";

type LoadingProps = {
  isRefreshControl?: boolean;
};

export function Loading({ isRefreshControl }: LoadingProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator />
    </View>
  );
}

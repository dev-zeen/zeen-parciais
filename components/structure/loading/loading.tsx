import { View } from "@/components/Themed";
import { ActivityIndicator } from "react-native";

type LoadingProps = {
  isRefreshControl?: boolean;
};

export function Loading({ isRefreshControl }: LoadingProps) {
  return (
    <View className="flex-1 justify-center items-center">
      {/* {isRefreshControl ? (
        <ActivityIndicator />
      ) : (
        <Progress.Circle size={isRefreshControl ? 25 : 75} indeterminate={true} borderWidth={2} />
      )} */}
      <ActivityIndicator />
    </View>
  );
}

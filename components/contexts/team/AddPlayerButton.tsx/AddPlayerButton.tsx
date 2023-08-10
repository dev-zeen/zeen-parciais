import { TouchableOpacity } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import { LineupPosition } from "@/models/Formations";

type AddPlayerButtonProps = {
  onPress?: () => void;
  positionLineup: LineupPosition;
  onPurchasePlayerOnMarket: (player: LineupPosition) => void;
};

export function AddPlayerButton({
  onPress,
  positionLineup,
  onPurchasePlayerOnMarket,
}: AddPlayerButtonProps) {
  return (
    <View
      className="items-center justify-center mt-5 bg-transparent"
      style={{
        gap: 2,
        maxWidth: 90,
        minWidth: 90,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => onPurchasePlayerOnMarket(positionLineup)}
        className="justify-center items-center border-2 w-11 h-11 rounded-full border-neutral-200 bg-white"
      >
        <Feather name="plus" size={18} />
      </TouchableOpacity>

      <View className="border border-neutral-200 bg-neutral-50 items-center justify-center rounded-lg px-2">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-semibold text-gray-500 text-center uppercase text-xs"
        >
          {positionLineup?.abbr}
        </Text>
      </View>
    </View>
  );
}

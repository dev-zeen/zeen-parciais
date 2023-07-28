import { Text, View } from "@/components/Themed";
import { FormationPlayer } from "@/models/Formations";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

type AddPlayerButtonProps = {
  onPress?: () => void;
  positionSchema: FormationPlayer;
  handleBuyPlayerOnMarket?: (player: FormationPlayer) => void;
};

export function AddPlayerButton({
  onPress,
  positionSchema,
  handleBuyPlayerOnMarket,
}: AddPlayerButtonProps) {
  return (
    <View
      className="items-center justify-center mt-4 bg-transparent"
      style={{
        gap: 2,
        maxWidth: 90,
        minWidth: 90,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() =>
          handleBuyPlayerOnMarket && handleBuyPlayerOnMarket(positionSchema)
        }
        className="justify-center items-center border-2 w-12 h-12 rounded-full border-neutral-200 bg-white"
      >
        <Feather name="plus" size={20} />
      </TouchableOpacity>

      <View className="border border-neutral-200 bg-neutral-50 items-center justify-center rounded-lg px-2">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-semibold text-gray-500 text-center uppercase text-xs"
        >
          {positionSchema?.abbr}
        </Text>
      </View>
    </View>
  );
}

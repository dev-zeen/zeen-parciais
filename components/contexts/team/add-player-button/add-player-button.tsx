import { Text, View } from "@/components/Themed";
import { FormationPlayer } from "@/models/Formations";
import { FontAwesome } from "@expo/vector-icons";
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
      className="items-center justify-center"
      style={{
        gap: 2,
        marginTop: 16,
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
        <FontAwesome name="plus" size={16} />
      </TouchableOpacity>

      <View
        style={{
          paddingHorizontal: 10,
        }}
        className="border border-neutral-200 bg-neutral-50 items-center justify-center rounded-lg"
      >
        <Text
          style={{
            fontSize: 11,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-semibold text-gray-500 text-center uppercase"
        >
          {positionSchema?.abbr}
        </Text>
      </View>
    </View>
  );
}

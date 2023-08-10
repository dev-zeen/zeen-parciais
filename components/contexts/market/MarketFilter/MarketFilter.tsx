import { Text, TouchableOpacity, View } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";

type MarketFilterProps = {
  handleClose: () => void;
};

export function MarketFilter({ handleClose }: MarketFilterProps) {
  return (
    <View className="flex-1 mt-32 mx-2 rounded-lg">
      <View
        className="items-center flex-row p-2 mx-2 rounded-lg mb-2"
        style={{
          marginHorizontal: 4,
          gap: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleClose}
          className="p-2 rounded-full border border-red-400 bg-red-300"
        >
          <Feather name="x" color="#525252" size={24} />
        </TouchableOpacity>

        <Text className="font-semibold text-lg">Filtrar</Text>
      </View>

      <ScrollView>
        <View className="flex-1 items-center justify-center">
          <Text>Market Filter</Text>
        </View>
      </ScrollView>
    </View>
  );
}

import { Text, View } from "@/components/Themed";
import { AddPlayerButton } from "@/components/contexts/team/add-player-button";
import { PlayerFootballField } from "@/components/contexts/team/player-football-field";
import { ISchema } from "@/models/Formations";

type ListReservePlayersProps = {
  schema: ISchema;
};

export function ListReservePlayers({ schema }: ListReservePlayersProps) {
  return (
    <View className="flex-1 p-2 rounded-lg items-center justify-center">
      <Text className="font-semibold text-base text-center">
        Banco de Reservas
      </Text>
      <View className="flex-row rounded-lg p-2 items-center justify-center">
        {schema.reserves?.map((item) => {
          return (
            <View
              key={item.position}
              className="flex-1 justify-center items-center"
            >
              {item && item.player ? (
                <PlayerFootballField player={item.player} />
              ) : (
                <AddPlayerButton
                  key={item.left}
                  onPress={() => console.log("Comprar reserva")}
                  positionSchema={item}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

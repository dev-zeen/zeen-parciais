import { Text, View } from "@/components/Themed";
import { AddPlayerButton } from "@/components/contexts/team/AddPlayerButton.tsx";
import { TeamPlayer } from "@/components/contexts/team/TeamPlayer";
import { ISchema } from "@/models/Formations";
import { useGetScoredPlayers } from "@/queries/stats";

type ListReservePlayersProps = {
  schema: ISchema;
};

export function ListReservePlayers({ schema }: ListReservePlayersProps) {
  const { data: playerStats } = useGetScoredPlayers();

  return (
    <View className="rounded-lg items-center justify-center">
      <Text className="font-semibold text-base text-center">
        Banco de Reservas
      </Text>
      <View className="flex-row rounded-lg py-2 mb-1 items-center justify-center">
        {schema.reserves?.map((item) => {
          return (
            <View
              key={item.position}
              className="flex-1 justify-center items-center"
            >
              {item && item.player ? (
                <TeamPlayer
                  player={item.player}
                  isPlayed={
                    playerStats?.atletas?.[item.player.atleta_id]
                      ?.entrou_em_campo
                  }
                />
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

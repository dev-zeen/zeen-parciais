import { FormationPlayer, ISchema, PlayerFormation } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";

function onRemovePlayer(formation: FormationPlayer[], playerId: number) {
  const updatedPlayers = formation.map((item) => {
    if (item.player?.atleta_id === playerId) {
      return { ...item, player: undefined };
    }
    return item;
  });

  return updatedPlayers;
}

export function removePlayerSchema(
  schema: ISchema,
  player: PlayerFormation | FullPlayer
) {
  const { atleta_id: playerId } = player;

  const isTeamPlayer = schema?.players.find(
    (item) => item.player?.atleta_id === playerId
  );

  if (isTeamPlayer) {
    const playersUpdated = onRemovePlayer(schema.players, playerId);
    const schemaUpdated = { ...schema, players: playersUpdated };
    return schemaUpdated;
  }
  const reservePlayersUpdated = onRemovePlayer(schema.reserves, playerId);
  const schemaUpdated = { ...schema, reserves: reservePlayersUpdated };
  return schemaUpdated;
}

export function onGetTeamPrice(players: FormationPlayer[]) {
  const price = players.reduce((acc, itemSchema) => {
    if (itemSchema.player?.preco_num) {
      return (acc += itemSchema.player?.preco_num);
    }
    return acc;
  }, 0);

  return price;
}

import { ISchema, PlayerFormation } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import { removePlayerSchema } from "@/utils/team";
import { create } from "zustand";

type TeamSchemaStore = {
  updateSchema: (schema: ISchema) => void;
  updateCapitain: (value: number) => void;
  updatePrice: (value: number) => void;
  removePlayerSchema: (player: PlayerFormation | FullPlayer) => void;
  price: number;
  schema: ISchema | undefined;
  capitain: number;
};

const useTeamSchemaStore = create<TeamSchemaStore>((set) => ({
  schema: undefined,
  capitain: 0,
  price: 0,

  updateSchema: (newSchema: ISchema) => {
    set((_state) => ({
      schema: newSchema,
    }));
  },
  updateCapitain: (newCapitain: number) => {
    set((_state) => ({
      capitain: newCapitain,
    }));
  },
  updatePrice: (priceUpdated: number) => {
    set((_state) => ({
      price: priceUpdated,
    }));
  },
  removePlayerSchema: (player: PlayerFormation | FullPlayer) => {
    set((state) => {
      const schemaUpdated: ISchema = removePlayerSchema(
        state.schema as ISchema,
        player
      );
      return {
        schema: schemaUpdated,
      };
    });
  },
}));

export default useTeamSchemaStore;

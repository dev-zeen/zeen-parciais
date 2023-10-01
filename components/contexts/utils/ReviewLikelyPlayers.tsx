import { Feather } from '@expo/vector-icons';

import { Text, TouchableOpacity } from '@/components/Themed';
import { FullPlayer } from '@/models/Stats';

type ReviewLikelyPlayersProps = {
  lineupPlayersUnlikely: FullPlayer[];
};

export function ReviewLikelyPlayers({ lineupPlayersUnlikely }: ReviewLikelyPlayersProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className="flex-row items-center justify-center border-2 border-red-400 rounded-lg"
      style={{
        padding: 12,
      }}>
      <Feather name="alert-octagon" color="#f87171" size={24} />
      <Text className="font-medium"> Você precisa rever sua escalação</Text>
    </TouchableOpacity>
  );
}

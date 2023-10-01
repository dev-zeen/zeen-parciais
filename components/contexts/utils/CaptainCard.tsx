import { Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import { IPositions } from '@/models/Stats';
import { useGetPositions } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { numberToString } from '@/utils/parseTo';

export function CaptainCard() {
  const { isMarketClose } = useMarketStatus();

  const { captain } = useMyClub();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const { data: positions } = useGetPositions();

  return (
    <View className="p-2 rounded-lg">
      <Text className="text-base font-semibold mt-0.5 mx-1 mb-2">Meu Capitão</Text>
      <View className="flex-row py-2 gap-x-1">
        <Image
          source={{
            uri: captain?.foto?.replace('FORMATO', '220x220'),
          }}
          className="w-14 h-14 rounded-full"
          alt={`Foto do ${captain?.apelido}`}
        />

        <View className=" flex-1 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold">{captain?.apelido}</Text>

            <View className="flex-row items-center">
              <Text className="text-xs  uppercase">
                {(positions as IPositions)[captain?.posicao_id as number].nome}
              </Text>
            </View>
          </View>

          {isMarketClose && captain && playerStats && playerStats.atletas[captain?.atleta_id] ? (
            <View className="items-center flex-row gap-x-2">
              <View className="flex-row items-center">
                <Text className="text-sm font-bold">
                  {numberToString(playerStats.atletas[captain?.atleta_id]?.pontuacao)}
                </Text>
                <Text className="text-xs font-semibold"> * 1.5</Text>
              </View>

              <Text
                className={`text-sm font-bold ${
                  playerStats?.atletas[captain?.atleta_id]?.pontuacao * 1.5 > 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}>
                {numberToString(playerStats?.atletas[captain?.atleta_id]?.pontuacao * 1.5)}
              </Text>
            </View>
          ) : (
            <></>
          )}
        </View>
      </View>
    </View>
  );
}

import React, { memo, useMemo } from 'react';

import { Text, View } from '@/components/Themed';
import { TopPlayerCard } from '@/components/contexts/utils/TopPlayerCard';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import useTopPlayer from '@/hooks/useTopPlayer';

export const TopPlayerList = memo(() => {
  const { topPlayers, bestPlayers } = useTopPlayer();

  const playersTabs: ITabs[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Titulares',
        content: () => {
          return (
            <View className="mt-1">
              {topPlayers?.map((item) => {
                return <TopPlayerCard key={item.Atleta.atleta_id} player={item} />;
              })}
            </View>
          );
        },
      },

      {
        id: 2,
        title: 'Capitão',
        content: () => {
          return (
            <View className="mt-1">
              {bestPlayers?.capitaes?.map((item) => {
                return <TopPlayerCard key={item.Atleta.atleta_id} player={item} />;
              })}
            </View>
          );
        },
      },
      {
        id: 3,
        title: 'Reservas',
        content: () => {
          return (
            <View className="mt-1">
              {bestPlayers?.reservas?.map((item) => {
                return <TopPlayerCard key={item.Atleta.atleta_id} player={item} />;
              })}
            </View>
          );
        },
      },
    ],
    [topPlayers, bestPlayers]
  );

  return (
    topPlayers &&
    bestPlayers && (
      <>
        <Text className="text-base font-semibold mt-1 mx-2 mb-2">Mais Escalados</Text>
        <Tabs tabs={playersTabs} />
      </>
    )
  );
});

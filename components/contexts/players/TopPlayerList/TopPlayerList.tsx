import { memo, useMemo } from 'react';

import { Text, View } from '@/components/Themed';
import { TopPlayerCard } from '@/components/contexts/utils/TopPlayerCard';
import { ITab, Tabs } from '@/components/structure/Tabs';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetTopPlayers, useGetTopReservePlayers } from '@/queries/players.query';

export const TopPlayerList = memo(() => {
  const { allowRequest } = useMarketStatus();

  const { data: topPlayers } = useGetTopPlayers(allowRequest);
  const { data: topReservePlayers } = useGetTopReservePlayers(allowRequest);

  // useEffect(() => {
  //   if (topPlayers && topPlayers?.length > 0) setHighlights(true);
  // }, [topPlayers]);

  const playersTabs: ITab[] = useMemo(
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
        title: 'Reservas',
        content: () => {
          return (
            <View className="mt-1">
              {topReservePlayers?.map((item) => {
                return <TopPlayerCard key={item.Atleta.atleta_id} player={item} />;
              })}
            </View>
          );
        },
      },
    ],
    [topPlayers, topReservePlayers]
  );

  return (
    topPlayers &&
    topPlayers.length > 0 && (
      <View className="rounded-lg p-2">
        <Text className="text-base font-semibold mt-1 mx-2 mb-2">Mais Escalados</Text>
        <Tabs tabs={playersTabs} />
      </View>
    )
  );
});

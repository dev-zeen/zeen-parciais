import { useCallback, useContext } from 'react';
import { Image, RefreshControl, ScrollView, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { TopPlayerList } from '@/components/contexts/players/TopPlayerList';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { TeamBanner } from '@/components/contexts/utils/TeamBanner';
import { Loading } from '@/components/structure/Loading';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import usePartialScore from '@/hooks/usePartialScore';
import usePlayerStats from '@/hooks/usePlayerStats';
import usePosition from '@/hooks/usePosition';
import useTopPlayer from '@/hooks/useTopPlayer';
import { IPositions } from '@/models/Stats';
import theme from '@/styles/theme';
import { numberToString } from '@/utils/parseTo';

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, isLoadingMarketStatus, onRefetchMarketStatus } = useMarketStatus();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const { myClub, isLoadingMyClub, onRefetchMyClub, isRefetchingMyClub, capitain } = useMyClub();

  const { playerStats, onRefetchStats } = usePlayerStats();

  const { topPlayers, onRefetchTopPlayers, onRefetchBestPlayers } = useTopPlayer();

  const { positions, isLoadingPositions, onRefetchPositions } = usePosition();

  const { partialScore, playersHaveAlreadyPlayed } = usePartialScore({
    teamId: myClub?.time.time_id as number,
  });

  const onRefetch = useCallback(async () => {
    await Promise.all([
      myClub && onRefetchMyClub && onRefetchMyClub(),
      topPlayers && topPlayers?.length > 0 && onRefetchBestPlayers(),
      onRefetchMarketStatus(),
      onRefetchTopPlayers(),
      onRefetchPositions(),
      onRefetchStats(),
    ]);
  }, [
    myClub,
    onRefetchBestPlayers,
    onRefetchMarketStatus,
    onRefetchMyClub,
    onRefetchPositions,
    onRefetchStats,
    onRefetchTopPlayers,
    topPlayers,
  ]);

  const isLoading = isAutheticated
    ? isLoadingMarketStatus || isLoadingPositions || isLoadingMarketStatus || isLoadingMyClub
    : isLoadingMarketStatus || isLoadingPositions;

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingMyClub} />}
        className={`rounded-lg ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}>
        <View
          className={`flex-1 rounded-lg ${colorTheme === 'dark' ? `bg-dark` : 'bg-light'}`}
          style={{
            gap: theme.Tokens.SPACING.xs,
            marginHorizontal: theme.Tokens.SPACING.xs,
            flex: 1,
            paddingBottom: 8,
          }}>
          <MarketStatusCard />
          {myClub ? (
            <>
              <TeamBanner team={myClub} />
              {!isMarketClose ? (
                <View className="flex-row justify-around items-center rounded-lg py-2">
                  <View className="justify-center items-center gap-1">
                    <Text className="font-light text-xs">Patrim.</Text>
                    <Text className="font-bold text-sm">{numberToString(myClub?.patrimonio)}</Text>

                    <Text
                      className={`text-sm font-semibold ${
                        myClub?.variacao_patrimonio > 0 ? 'text-green-500' : 'text-folly'
                      } `}>
                      {numberToString(myClub?.variacao_patrimonio)}
                    </Text>
                  </View>

                  <View className="justify-center items-center gap-1">
                    <Text className="font-light text-xs">Ult. Rodada</Text>

                    <Text className="font-bold text-sm">{numberToString(myClub?.pontos)}</Text>

                    <Text
                      className={`text-sm font-semibold ${
                        myClub?.variacao_pontos > 0 ? 'text-green-500' : 'text-folly'
                      } `}>
                      {numberToString(myClub?.variacao_pontos)}
                    </Text>
                  </View>

                  <View className="justify-center items-center gap-1">
                    <Text className="font-light text-xs">
                      {isMarketClose ? 'Total Parcial' : 'Total'}
                    </Text>
                    <Text className="font-bold text-sm">
                      {numberToString(myClub?.pontos_campeonato)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  className={`flex-row justify-between items-center gap-2 ${
                    colorTheme === 'dark' ? `bg-dark` : 'bg-light'
                  }`}>
                  <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
                    <Text className="font-semibold text-xs">Parcial</Text>
                    <Text className="font-bold text-lg text-green-500">
                      {numberToString(partialScore)}
                    </Text>
                  </View>
                  <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
                    <Text className="font-semibold text-xs">Total</Text>

                    <Text className="font-bold text-lg text-green-500">
                      {numberToString(myClub?.pontos_campeonato + partialScore)}
                    </Text>
                  </View>
                  <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
                    <Text className="font-semibold text-xs">Pontuados</Text>

                    <Text className="font-bold text-lg text-green-500">
                      {`${playersHaveAlreadyPlayed || '0'}/12`}
                    </Text>
                  </View>
                </View>
              )}

              <View className="p-2 rounded-lg">
                <Text className="text-base font-semibold mt-0.5 mx-1 mb-2">Meu Capitão</Text>
                <View className="flex-row py-2 gap-x-1">
                  <Image
                    source={{
                      uri: capitain?.foto?.replace('FORMATO', '220x220'),
                    }}
                    className="w-14 h-14 rounded-full"
                    alt={`Foto do ${capitain?.apelido}`}
                  />

                  <View className=" flex-1 flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm font-semibold">{capitain?.apelido}</Text>

                      <View className="flex-row items-center">
                        <Text className="text-xs font-light uppercase">
                          {(positions as IPositions)[capitain?.posicao_id as number].nome}
                        </Text>
                      </View>
                    </View>

                    {isMarketClose &&
                    capitain &&
                    playerStats &&
                    playerStats.atletas[capitain?.atleta_id] ? (
                      <View className="items-center flex-row gap-x-2">
                        <View className="flex-row items-center">
                          <Text className="text-sm font-bold">
                            {numberToString(playerStats.atletas[capitain?.atleta_id]?.pontuacao)}
                          </Text>
                          <Text className="text-xs font-semibold"> * 1.5</Text>
                        </View>

                        <Text
                          className={`text-sm font-bold ${
                            playerStats?.atletas[capitain?.atleta_id]?.pontuacao * 1.5 > 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}>
                          {numberToString(
                            playerStats?.atletas[capitain?.atleta_id]?.pontuacao * 1.5
                          )}
                        </Text>
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                </View>
              </View>
            </>
          ) : (
            <Login />
          )}
          <View className="rounded-lg p-2">
            <TopPlayerList />
          </View>
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

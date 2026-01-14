import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, useColorScheme } from 'react-native';

import { View } from '@/components/Themed';
import { TopPlayerList } from '@/components/contexts/players/TopPlayerList';
import { CaptainCard } from '@/components/contexts/utils/CaptainCard';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { ReviewLikelyPlayers } from '@/components/contexts/utils/ReviewLikelyPlayers';
import { StatsClubCard } from '@/components/contexts/utils/StatsClubCard';
import { TeamBanner } from '@/components/contexts/utils/TeamBanner';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetMyClub } from '@/queries/club.query';
import { useGetPositions, useGetTopPlayers } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import theme from '@/styles/theme';

export default () => {
  const colorTheme = useColorScheme();

  const {
    marketStatus,
    isLoadingMarketStatus,
    onRefetchMarketStatus,
    isMarketClose,
    allowRequest,
  } = useMarketStatus();

  const {
    data: myClub,
    isLoading: isLoadingMyClub,
    refetch: onRefetchMyClub,
    isRefetching: isRefetchingMyClub,
  } = useGetMyClub(allowRequest);

  const { refetch: onRefetchStats } = useGetScoredPlayers(isMarketClose);

  const { refetch: onRefetchTopPlayers } = useGetTopPlayers();

  const lineupPlayersUnlikely = useMemo(
    () =>
      myClub?.atletas?.filter((player) => player.status_id !== ENUM_STATUS_MARKET_PLAYER.PROVAVEL),
    [myClub?.atletas]
  );

  const { isLoading: isLoadingPositions, refetch: onRefetchPositions } = useGetPositions();

  const onRefetch = useCallback(async () => {
    await Promise.all([
      myClub && onRefetchMyClub && onRefetchMyClub(),
      onRefetchMarketStatus(),
      onRefetchTopPlayers(),
      onRefetchPositions(),
      onRefetchStats(),
    ]);
  }, [
    myClub,
    onRefetchMarketStatus,
    onRefetchMyClub,
    onRefetchPositions,
    onRefetchStats,
    onRefetchTopPlayers,
  ]);

  const isLoading = allowRequest
    ? isLoadingMarketStatus || isLoadingPositions || isLoadingMarketStatus || isLoadingMyClub
    : isLoadingMarketStatus || isLoadingPositions;

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaViewContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingMyClub} />}
        className={`rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <View
          className={`flex-1 rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
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

              <StatsClubCard team={myClub} round={marketStatus?.rodada_atual} />

              {lineupPlayersUnlikely && lineupPlayersUnlikely.length > 0 && (
                <ReviewLikelyPlayers lineupPlayersUnlikely={lineupPlayersUnlikely} />
              )}

              <CaptainCard />

              <TopPlayerList />
            </>
          ) : (
            <Login />
          )}
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

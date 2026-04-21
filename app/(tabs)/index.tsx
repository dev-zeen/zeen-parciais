import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { View } from '@/components/Themed';
import { AlertsCard } from '@/components/contexts/home/AlertsCard';
import { PlayerHighlightsCarousel } from '@/components/contexts/home/PlayerHighlightsCarousel';
import { QuickActionsGrid } from '@/components/contexts/home/QuickActionsGrid';
import { StatsOverviewCard } from '@/components/contexts/home/StatsOverviewCard';
import { TeamSummaryCard } from '@/components/contexts/home/TeamSummaryCard';
import { CaptainCard } from '@/components/contexts/utils/CaptainCard';
import { InvitesAlert } from '@/components/contexts/utils/InvitesAlert';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGetMyClub } from '@/queries/club.query';
import { useGetPositions, useGetTopPlayers } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import theme from '@/styles/theme';

export default () => {
  const colorTheme = useThemeColor();

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
    <SafeAreaViewContainer edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingMyClub} />}
        className={`rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <View
          className={`flex-1 rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
          style={{
            gap: theme.Tokens.SPACING.xs,
            marginHorizontal: theme.Tokens.SPACING.xs,
          }}>
          {/* Market Status Bar */}
          <MarketStatusCard />

          {/* Invites Alert */}
          <InvitesAlert />

          {myClub ? (
            <>
              {/* Team Summary */}
              <TeamSummaryCard team={myClub} />

              {/* Quick Actions Grid */}
              <QuickActionsGrid />

              {/* Stats Overview with Chart */}
              <StatsOverviewCard />

              {/* Captain Card - Only shows if captain exists */}
              <CaptainCard />

              {/* Alerts & Notices */}
              <AlertsCard lineupPlayersUnlikely={lineupPlayersUnlikely} />

              {/* Player Highlights Carousel */}
              <PlayerHighlightsCarousel />
            </>
          ) : (
            <Login />
          )}
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

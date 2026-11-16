import { useCallback, useContext, useMemo } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { View } from '@/components/Themed';
import { AlertsCard } from '@/components/contexts/home/AlertsCard';
import { PlayerHighlightsCarousel } from '@/components/contexts/home/PlayerHighlightsCarousel';
import { StatsOverviewCard } from '@/components/contexts/home/StatsOverviewCard';
import { TeamSummaryCard } from '@/components/contexts/home/TeamSummaryCard';
import { CaptainCard } from '@/components/contexts/utils/CaptainCard';
import { InvitesAlert } from '@/components/contexts/utils/InvitesAlert';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { MarketStatusCard } from '@/components/contexts/utils/MarketStatusCard';
import { ErrorScreen } from '@/components/structure/ErrorScreen';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { ENUM_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGetMyClub } from '@/queries/club.query';
import { useGetPositions, useGetTopPlayers } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import theme from '@/styles/theme';

export default () => {
  const colorTheme = useThemeColor();
  const tabBarSpacing = useTabBarSpacing();
  const { isAutheticated } = useContext(AuthContext);

  const {
    marketStatus,
    isLoadingMarketStatus,
    isErrorMarketStatus,
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
    ? isLoadingMarketStatus || isLoadingPositions || isLoadingMyClub
    : isLoadingMarketStatus || isLoadingPositions;

  // Mesmo padrão das demais abas protegidas (Time, Ligas, Perfil)
  if (!isAutheticated) {
    return <Login />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isErrorMarketStatus) {
    return (
      <ErrorScreen
        message="Não foi possível carregar os dados do mercado."
        onRetry={onRefetchMarketStatus}
      />
    );
  }

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingMyClub} />}
        contentContainerStyle={{ paddingBottom: tabBarSpacing.contentBottom }}
        className={`rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
        <View
          className={`flex-1 rounded-lg ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`}
          style={{
            // Padrão das abas: 16 nas laterais, 8 no topo, 12 entre blocos
            gap: theme.Tokens.SPACING.sm,
            marginHorizontal: theme.Tokens.SPACING.md,
            paddingTop: theme.Tokens.SPACING.xs,
          }}>
          {/* Market Status Bar */}
          <MarketStatusCard />

          {/* Invites Alert */}
          <InvitesAlert />

          {myClub ? (
            <>
              {/* Team Summary */}
              <TeamSummaryCard team={myClub} />

              {/* Stats Overview with Chart */}
              <StatsOverviewCard />

              {/* Captain Card - Only shows if captain exists */}
              <CaptainCard />

              {/* Alerts & Notices */}
              <AlertsCard lineupPlayersUnlikely={lineupPlayersUnlikely} />

              {/* Player Highlights Carousel */}
              <PlayerHighlightsCarousel />
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

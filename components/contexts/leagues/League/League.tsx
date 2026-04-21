import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import { ClubCard } from '@/components/contexts/leagues/club/ClubCard';
import { LeagueHeader } from '@/components/contexts/leagues/League/LeagueHeader';
import { LeagueTabs } from '@/components/contexts/leagues/League/LeagueTabs';
import { DialogComponent } from '@/components/structure/Dialog';
import { View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ClubByLeague, League as LeagueModel } from '@/models/Leagues';
import { FullPlayer } from '@/models/Stats';
import { useGetLeague } from '@/queries/leagues.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { OrderByOptions, onGetLeagueWithPartials } from '@/utils/leagues';
import { ClubsByLeagueUtils } from '@/utils/partials';

interface LeagueProps {
  league: LeagueModel;
  clubsByLeague: ClubsByLeagueUtils;
}

export function League({ league, clubsByLeague }: LeagueProps) {
  const colorTheme = useThemeColor();

  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);
  const { data: market } = useGetMarket();

  const { refetch: onRefetchLeague, isRefetching: isRefetchingLeague } = useGetLeague(
    league.liga.slug,
    allowRequest
  );

  const [isSortingClubs, setIsSortingClubs] = useState(false);
  const [orderBy, setOrderBy] = useState<OrderByOptions>(OrderByOptions.RODADA);
  const [showModalPublicLeague, setShowModalPublicLeague] = useState(() =>
    Boolean(league && !league.liga.time_dono_id)
  );

  const handleOnPressOrderBy = useCallback((sortProp: OrderByOptions) => {
    setIsSortingClubs(true);
    setOrderBy(sortProp);
    requestAnimationFrame(() => setIsSortingClubs(false));
  }, []);

  type ClubWithCaptain = ClubByLeague & {
    captainId?: number;
    captainName?: string;
    captainPhoto?: string;
  };

  const playerById = useMemo(() => {
    const map = new Map<number, FullPlayer>();
    (market?.atletas ?? []).forEach((p) => map.set(p.atleta_id, p));
    return map;
  }, [market?.atletas]);

  const baseClubs: ClubByLeague[] = useMemo(() => {
    if (isMarketClose && clubsByLeague && playerStats && marketStatus && league) {
      return onGetLeagueWithPartials(league, clubsByLeague, playerStats, marketStatus);
    }

    return (league?.times ?? []).map((t) => ({
      ...t,
      pontos: t.pontos,
      variacao: t.variacao,
      patrimonio: t.patrimonio,
    }));
  }, [clubsByLeague, isMarketClose, league, marketStatus, playerStats]);

  const clubsWithCaptain: ClubWithCaptain[] = useMemo(() => {
    return baseClubs.map((club) => {
      const meta = clubsByLeague?.[String(club.time_id)];
      const captainId = meta?.capitao ? Number(meta.capitao) : undefined;
      const captainPlayer = captainId ? playerById.get(captainId) : undefined;

      return {
        ...club,
        captainId,
        captainName:
          captainPlayer?.apelido ??
          captainPlayer?.apelido_abreviado ??
          (captainId ? `#${captainId}` : undefined),
        captainPhoto: captainPlayer?.foto,
      };
    });
  }, [baseClubs, clubsByLeague, playerById]);

  const getSortValue = useCallback(
    (club: ClubByLeague) => {
      switch (orderBy) {
        case OrderByOptions.PATRIMONIO:
          return club.patrimonio ?? 0;
        case OrderByOptions.CAMPEONATO:
          return club.pontos?.campeonato ?? 0;
        case OrderByOptions.MES:
          return club.pontos?.mes ?? 0;
        case OrderByOptions.TURNO:
          return club.pontos?.turno ?? 0;
        case OrderByOptions.CAPITAO:
          return club.pontos?.capitao ?? 0;
        case OrderByOptions.RODADA:
        default:
          return club.pontos?.rodada ?? 0;
      }
    },
    [orderBy]
  );

  const sortedClubs: ClubWithCaptain[] = useMemo(() => {
    const copy = [...clubsWithCaptain];
    copy.sort((a, b) => {
      const diff = getSortValue(b) - getSortValue(a);
      if (diff !== 0) return diff;
      return (b.patrimonio ?? 0) - (a.patrimonio ?? 0);
    });
    return copy;
  }, [clubsWithCaptain, getSortValue]);

  const highestScoringTeam = useMemo(
    () => (sortedClubs[0] ? getSortValue(sortedClubs[0]) : 0),
    [getSortValue, sortedClubs]
  );

  const keyExtractor = useCallback((item: ClubWithCaptain) => `${item.time_id}`, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ClubWithCaptain>) => {
      const score = getSortValue(item);
      const diffScore = score - highestScoringTeam;
      const variation =
        !isMarketClose && orderBy !== OrderByOptions.RODADA && orderBy !== OrderByOptions.PATRIMONIO
          ? (() => {
              const v = item.variacao;
              switch (orderBy) {
                case OrderByOptions.CAMPEONATO:
                  return v?.campeonato;
                case OrderByOptions.MES:
                  return v?.mes;
                case OrderByOptions.TURNO:
                  return v?.turno;
                case OrderByOptions.CAPITAO:
                  return v?.capitao;
                default:
                  return undefined;
              }
            })()
          : undefined;

      return (
        <ClubCard
          score={score}
          diffScore={diffScore}
          variation={variation}
          club={item}
          orderBy={orderBy}
          position={index + 1}
          isMarketClose={isMarketClose}
          isMyTeam={league?.time_usuario?.time_id === item.time_id}
        />
      );
    },
    [getSortValue, highestScoringTeam, isMarketClose, league?.time_usuario?.time_id, orderBy]
  );

  const bgColor = colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull;

  const listHeader = useMemo(
    () => <LeagueHeader liga={league.liga} destaques={league.destaques} />,
    [league.destaques, league.liga]
  );

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <LeagueTabs activeTab={orderBy} onTabChange={handleOnPressOrderBy} />

      {isSortingClubs ? (
        <View className="flex-1 items-center justify-center mx-2 pt-6 mt-2 rounded-lg mb-2">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl onRefresh={onRefetchLeague} refreshing={isRefetchingLeague} />
          }
          data={sortedClubs}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          ItemSeparatorComponent={() => (
            <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
          )}
          renderItem={renderItem}
          initialNumToRender={30}
          maxToRenderPerBatch={15}
          contentContainerStyle={[styles.listContent, { backgroundColor: bgColor }]}
        />
      )}

      {showModalPublicLeague && (
        <DialogComponent
          isVisible={showModalPublicLeague}
          onPressConfirm={() => setShowModalPublicLeague(false)}
          subtitile="Apenas os 100 primeiros times são exibidos nas ligas públicas por questões de desempenho."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  highlightsWrapper: {
    marginBottom: 12,
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  highlightsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  highlightsScroll: {
    gap: 8,
    paddingBottom: 4,
  },
});

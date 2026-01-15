import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { View } from '@/components/Themed';
import { ClubCard } from '@/components/contexts/leagues/club/ClubCard';
import { DialogComponent } from '@/components/structure/Dialog';
import { Loading } from '@/components/structure/Loading';
import { ITab, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
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
  const colorTheme = useColorScheme();

  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);
  const { data: market } = useGetMarket();

  const { refetch: onRefetchLeague, isRefetching: isRefetchingLeague } = useGetLeague(
    league.liga.slug,
    allowRequest
  );

  const [isSortingClubs, setIsSortingClubs] = useState(false);
  const [orderBy, setOrderBy] = useState<OrderByOptions>(OrderByOptions.RODADA);
  const [showModalPublicLeague, setShowModalPublicLeague] = useState(false);

  const handleOnPressOrderBy = useCallback(
    (sortProp: OrderByOptions) => {
      setIsSortingClubs(true);
      setOrderBy(sortProp);
      // cálculo é memoizado; só usamos esse flag pra UX (spinner rápido)
      requestAnimationFrame(() => setIsSortingClubs(false));
    },
    []
  );

  const tabs: ITab[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Rodada',
        onPress() {
          handleOnPressOrderBy(OrderByOptions.RODADA);
        },
      },
      {
        id: 2,
        title: 'Total',
        onPress() {
          handleOnPressOrderBy(OrderByOptions.CAMPEONATO);
        },
      },
      {
        id: 3,
        title: 'Turno',
        onPress() {
          handleOnPressOrderBy(OrderByOptions.TURNO);
        },
      },
      {
        id: 4,
        title: 'Mês',
        onPress() {
          handleOnPressOrderBy(OrderByOptions.MES);
        },
      },
      {
        id: 5,
        title: 'C$',
        onPress() {
          handleOnPressOrderBy(OrderByOptions.PATRIMONIO);
        },
      },
    ],
    [handleOnPressOrderBy]
  );

  type ClubWithCaptain = ClubByLeague & { captainId?: number; captainName?: string; captainPhoto?: string };

  const playerById = useMemo(() => {
    const map = new Map<number, FullPlayer>();
    (market?.atletas ?? []).forEach((p) => map.set(p.atleta_id, p));
    return map;
  }, [market?.atletas]);

  const baseClubs: ClubByLeague[] = useMemo(() => {
    // Quando mercado fechado e temos clubsByLeague + playerStats, podemos calcular parciais ao vivo sem fetch por item.
    if (isMarketClose && clubsByLeague && playerStats && marketStatus && league) {
      return onGetLeagueWithPartials(league, clubsByLeague, playerStats, marketStatus);
    }

    // Mercado aberto: usar dados “mínimos” já presentes em league.times
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
    copy.sort((a, b) => getSortValue(b) - getSortValue(a));
    return copy;
  }, [clubsWithCaptain, getSortValue]);

  const highestScoringTeam = useMemo(() => (sortedClubs[0] ? getSortValue(sortedClubs[0]) : 0), [getSortValue, sortedClubs]);

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

  const onRefetch = useCallback(async () => {
    await onRefetchLeague();
  }, [onRefetchLeague]);

  useEffect(() => {
    if (league && !league?.liga.time_dono_id) {
      setShowModalPublicLeague(true);
    }
  }, [league]);

  if (!renderItem) {
    return <Loading />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}>
      <View
        style={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <View
          style={{
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}>
          <Tabs tabs={tabs} />
        </View>
      </View>

      {isSortingClubs ? (
        <View className="flex-1 items-center justify-center mx-2 pt-6 mt-2 rounded-lg mb-2">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingLeague} />}
          data={sortedClubs}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => (
            <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
          )}
          renderItem={renderItem}
          initialNumToRender={30}
          maxToRenderPerBatch={15}
          contentContainerStyle={{
            paddingTop: 8,
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
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

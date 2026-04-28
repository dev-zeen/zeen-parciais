import { Feather } from '@expo/vector-icons';
import { Link, Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  UIManager,
  View as RNView,
} from 'react-native';

import captainIcon from '@/assets/images/letter-c.png';
import { Text } from '@/components/Themed';
import { Cup } from '@/components/contexts/leagues/Cup';
import { LeagueTabs } from '@/components/contexts/leagues/League/LeagueTabs';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { AuthContext } from '@/contexts/Auth.context';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ClubByLeague } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';
import { useGetLeague } from '@/queries/leagues.query';
import { useGetMarket } from '@/queries/market.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import theme from '@/styles/theme';
import { OrderByOptions, onGetLeagueWithPartials } from '@/utils/leagues';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ORDER_LABEL: Record<OrderByOptions, string> = {
  [OrderByOptions.RODADA]: 'Rodada',
  [OrderByOptions.MES]: 'Mês',
  [OrderByOptions.TURNO]: 'Turno',
  [OrderByOptions.CAMPEONATO]: 'Camp.',
  [OrderByOptions.CAPITAO]: 'Capitão',
  [OrderByOptions.PATRIMONIO]: 'Patrimônio',
};

function ClassicTableHeader({ isDark, orderBy }: { isDark: boolean; orderBy: OrderByOptions }) {
  const statColor = isDark ? '#6b7280' : '#9ca3af';
  return (
    <RNView
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
      }}>
      <RNView style={{ width: 20 }} />
      <RNView style={{ width: 36 }} />
      <RNView style={{ flex: 1 }} />
      <Text
        style={{ width: 64, fontSize: 10, fontWeight: '700', color: statColor, textAlign: 'right' }}>
        {ORDER_LABEL[orderBy]}
      </Text>
      <RNView style={{ width: 18 }} />
    </RNView>
  );
}

function ClassicRow({
  entry,
  rank,
  isExpanded,
  isMyTeam,
  onToggle,
  isDark,
  score,
  orderBy,
  hasCaptain,
}: {
  entry: ClubByLeague;
  rank: number;
  isExpanded: boolean;
  isMyTeam: boolean;
  onToggle: () => void;
  isDark: boolean;
  score: number;
  orderBy: OrderByOptions;
  hasCaptain: boolean;
}) {
  const cardBg = isDark ? '#111827' : '#ffffff';
  const myTeamBg = isDark ? '#0f2318' : '#f0fdf4';
  const borderColor = isMyTeam ? '#22c55e50' : isDark ? '#374151' : '#e5e7eb';
  const statColor = isDark ? '#9ca3af' : '#6b7280';
  const valueColor = isDark ? '#e5e7eb' : '#111827';
  const dividerColor = isDark ? '#1f2937' : '#f3f4f6';

  const scoreLabel =
    orderBy === OrderByOptions.PATRIMONIO
      ? `C$ ${score.toFixed(2)}`
      : score.toFixed(2);

  const detailStats = [
    { label: 'Rodada', value: (entry.pontos?.rodada ?? 0).toFixed(2) },
    { label: 'Mês', value: (entry.pontos?.mes ?? 0).toFixed(2) },
    { label: 'Turno', value: (entry.pontos?.turno ?? 0).toFixed(2) },
    { label: 'Camp.', value: (entry.pontos?.campeonato ?? 0).toFixed(2) },
    ...(hasCaptain
      ? [{ label: 'Capitão', value: (entry.pontos?.capitao ?? 0).toFixed(2) }]
      : []),
    { label: 'Patrimônio', value: `C$ ${(entry.patrimonio ?? 0).toFixed(2)}` },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={{
        borderRadius: 12,
        backgroundColor: isMyTeam ? myTeamBg : cardBg,
        borderWidth: 1,
        borderColor,
        overflow: 'hidden',
      }}>
      <RNView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 12,
          gap: 8,
        }}>
        <Text
          style={{
            width: 20,
            fontSize: 13,
            fontWeight: '700',
            color: rank <= 4 ? '#22c55e' : statColor,
            textAlign: 'center',
          }}>
          {rank}
        </Text>

        <RNView style={{ position: 'relative' }}>
          <Image
            source={{ uri: entry.url_escudo_png }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          {entry.assinante && (
            <RNView
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#f59e0b',
                borderWidth: 1.5,
                borderColor: isMyTeam ? myTeamBg : cardBg,
              }}
            />
          )}
        </RNView>

        <RNView style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 13, fontWeight: '700', color: valueColor }}>
            {entry.nome}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, color: statColor }}>
            {entry.nome_cartola}
          </Text>
        </RNView>

        <Text
          style={{
            width: 64,
            fontSize: 13,
            fontWeight: '800',
            color: valueColor,
            textAlign: 'right',
          }}>
          {scoreLabel}
        </Text>

        <Feather
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={statColor}
        />
      </RNView>

      {isExpanded && (
        <RNView
          style={{
            paddingHorizontal: 12,
            paddingBottom: 12,
            borderTopWidth: 1,
            borderTopColor: dividerColor,
            gap: 10,
          }}>
          <RNView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10 }}>
            {detailStats.map(({ label, value }) => (
              <RNView
                key={label}
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 10, color: statColor, marginBottom: 2 }}>{label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: valueColor }}>{value}</Text>
              </RNView>
            ))}
          </RNView>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push(`/leagues/club/${entry.time_id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 10,
              paddingVertical: 9,
              backgroundColor: '#22c55e18',
              borderWidth: 1,
              borderColor: '#22c55e40',
            }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#22c55e' }}>Ver time</Text>
            <Feather name="arrow-right" size={13} color="#22c55e" />
          </TouchableOpacity>
        </RNView>
      )}
    </TouchableOpacity>
  );
}

export default () => {
  const colorTheme = useThemeColor();
  const isDark = colorTheme === 'dark';
  const { isAutheticated } = useContext(AuthContext);
  const { id: slug } = useLocalSearchParams();
  const { allowRequest, isMarketClose, marketStatus } = useMarketStatus();

  const { data: myClub } = useGetMyClub(allowRequest);
  const { league, clubsByLeague, isLoadingLeague } = useLeague({ slug: slug as string });
  const { data: playerStats } = useGetScoredPlayers(isMarketClose);
  useGetMarket();
  const { refetch: onRefetchLeague, isRefetching: isRefetchingLeague } = useGetLeague(
    slug as string,
    allowRequest
  );

  const [orderBy, setOrderBy] = useState<OrderByOptions>(OrderByOptions.RODADA);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSorting, setIsSorting] = useState(false);

  const handleSortChange = useCallback((tab: OrderByOptions) => {
    setIsSorting(true);
    setOrderBy(tab);
    requestAnimationFrame(() => setIsSorting(false));
  }, []);

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

  const getSortValue = useCallback(
    (club: ClubByLeague): number => {
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

  const sortedClubs = useMemo(() => {
    const copy = [...baseClubs];
    copy.sort((a, b) => {
      const diff = getSortValue(b) - getSortValue(a);
      if (diff !== 0) return diff;
      return (b.patrimonio ?? 0) - (a.patrimonio ?? 0);
    });
    return copy;
  }, [baseClubs, getSortValue]);

  function toggleExpand(id: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;
  if (isLoadingLeague) return <LoadingScreen />;

  const bgFull = isDark ? Colors.dark.backgroundFull : Colors.light.backgroundFull;
  const cardBg = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const isOwner =
    !!league?.liga?.time_dono_id &&
    (myClub?.time?.time_id ?? 0) === league.liga.time_dono_id;
  const myTeamId = myClub?.time?.time_id ?? 0;
  const hasCaptain = !league?.liga?.sem_capitao;

  const header = (
    <RNView
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: bgFull,
        gap: 10,
      }}>
      <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor,
          }}>
          <Feather name="chevron-left" size={20} color={isDark ? '#e5e7eb' : '#111827'} />
        </TouchableOpacity>

        <RNView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            paddingHorizontal: 12,
          }}>
          <Image
            source={{
              uri: league?.liga.mata_mata
                ? league.liga.url_trofeu_png
                : league?.liga.url_flamula_png,
            }}
            style={{ width: theme.Tokens.SIZE.sm, height: theme.Tokens.SIZE.sm }}
            alt={`Imagem da liga ${league?.liga.nome}`}
          />
          <Text
            style={{
              fontWeight: '700',
              fontSize: theme.Tokens.TEXT.xs,
              textTransform: 'uppercase',
            }}>
            {league?.liga.nome}
          </Text>
          {!league?.liga.sem_capitao && (
            <Image
              source={captainIcon}
              style={{ width: 24, height: 24, margin: 4 }}
              alt="Liga com Capitão"
            />
          )}
        </RNView>

        {isOwner && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: '/leagues/create/invite',
                params: {
                  type: league?.liga?.mata_mata ? 'matamata' : 'classic',
                  slug: league?.liga?.slug,
                },
              })
            }
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#22c55e20',
              borderWidth: 1,
              borderColor: '#22c55e',
            }}>
            <Feather name="user-plus" size={18} color="#22c55e" />
          </TouchableOpacity>
        )}
      </RNView>

      {league?.pedidos && league.pedidos.length > 0 && (
        <Link
          asChild
          href={{
            pathname: '/leagues/league/requests/[id]',
            params: { id: slug as string },
          }}>
          <Pressable
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 8,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#3b82f6',
              backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            }}>
            {({ pressed }) => (
              <RNView
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <RNView
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: '#7c3aed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                  }}>
                  <Text style={{ color: '#f5f5f5', fontWeight: '600', fontSize: 12 }}>
                    {league.pedidos?.length}
                  </Text>
                </RNView>
                <Feather
                  name="mail"
                  size={16}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                  style={{ opacity: pressed ? 0.6 : 1 }}
                />
              </RNView>
            )}
          </Pressable>
        </Link>
      )}
    </RNView>
  );

  if (league?.liga.mata_mata) {
    return (
      <SafeAreaViewContainer edges={['top']}>
        <RNView style={{ flex: 1, backgroundColor: bgFull }}>
          {header}
          <Cup league={league} />
        </RNView>
      </SafeAreaViewContainer>
    );
  }

  return (
    <SafeAreaViewContainer edges={['top']}>
      <RNView style={{ flex: 1, backgroundColor: bgFull }}>
        {header}

        <LeagueTabs activeTab={orderBy} onTabChange={handleSortChange} />

        {isSorting ? (
          <RNView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </RNView>
        ) : (
          <FlatList
            data={sortedClubs}
            keyExtractor={(item) => `${item.time_id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
            refreshControl={
              <RefreshControl onRefresh={onRefetchLeague} refreshing={isRefetchingLeague} />
            }
            ListHeaderComponent={
              <ClassicTableHeader isDark={isDark} orderBy={orderBy} />
            }
            ItemSeparatorComponent={() => <RNView style={{ height: 6 }} />}
            initialNumToRender={30}
            maxToRenderPerBatch={15}
            renderItem={({ item, index }) => (
              <ClassicRow
                entry={item}
                rank={index + 1}
                isExpanded={expandedId === item.time_id}
                isMyTeam={item.time_id === myTeamId}
                onToggle={() => toggleExpand(item.time_id)}
                isDark={isDark}
                score={getSortValue(item)}
                orderBy={orderBy}
                hasCaptain={hasCaptain}
              />
            )}
          />
        )}
      </RNView>
    </SafeAreaViewContainer>
  );
};

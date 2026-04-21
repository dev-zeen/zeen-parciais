import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  Image,
  ListRenderItemInfo,
  RefreshControl,
  SectionList,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { EmptyLeagueList } from '@/components/contexts/leagues/EmptyLeagueList';
import { LeagueCard } from '@/components/contexts/leagues/LeagueCard';
import { PointsCompetitionCard } from '@/components/contexts/leagues/PointsCompetitionCard';
import { MaintenanceMarket } from '@/components/contexts/utils/MaintenanceMarket';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { Login } from '@/components/structure/Login';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useInvites from '@/hooks/useInvites';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePointsCompetitionInvites from '@/hooks/usePointsCompetitionInvites';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LeagueUserDetails } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';
import { useGetFinalizedPointsCompetitions, useGetPointsCompetitions } from '@/queries/competitions.query';
import { useGetLeagues } from '@/queries/leagues.query';

type SectionLeagueProps = {
  title: string;
  subtitle?: string;
  data: LeagueUserDetails[];
};

export default function () {
  const colorTheme = useThemeColor();

  const { isAutheticated } = useContext(AuthContext);

  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();

  const {
    data: myClub,
    isRefetching: isRefetchingMyClub,
    refetch: onRefetchMyClub,
  } = useGetMyClub(allowRequest);


  const { invites, isLoadingInvites, onRefetchInvites, isRefetchingInvites } = useInvites();
  const { invites: pointsInvites } = usePointsCompetitionInvites();
  
  const invitesCount = useMemo(
    () => (invites?.convites?.length ?? 0) + (pointsInvites?.length ?? 0),
    [invites?.convites?.length, pointsInvites?.length]
  );

  const [search, setSearch] = useState('');

  const {
    data: leagues,
    refetch: onRefetchLeagues,
    isRefetching: isRefetchingLeagues,
  } = useGetLeagues(!!allowRequest);

  const {
    data: pointsCompetitions,
    refetch: onRefetchPointsCompetitions,
    isRefetching: isRefetchingPointsCompetitions,
  } = useGetPointsCompetitions(!!allowRequest);

  const {
    data: finalizedCompetitions,
    refetch: onRefetchFinalizedCompetitions,
    isRefetching: isRefetchingFinalizedCompetitions,
  } = useGetFinalizedPointsCompetitions(!!allowRequest);

  const sectionLeaguesList = useMemo(() => {
    if (!leagues) return [];

    const { ligas } = leagues;
    const query = search.trim().toLowerCase();
    const matchesQuery = (league: LeagueUserDetails) =>
      !query || league.nome.toLowerCase().includes(query);

    const max_ligas_pro = marketStatus?.max_ligas_pro ?? 0;
    const max_ligas_free = marketStatus?.max_ligas_free ?? 0;
    const max_ligas_matamata_pro = marketStatus?.max_ligas_matamata_pro ?? 0;
    const max_ligas_matamata_free = marketStatus?.max_ligas_matamata_free ?? 0;

    const privateLeaguesAll = ligas.filter((item) => item.time_dono_id && !item.mata_mata);
    const cupsAll = ligas.filter((item) => item.mata_mata);
    const defaultLeaguesAll = ligas.filter((item) => !item.time_dono_id);

    const privateLeagues = privateLeaguesAll.filter(matchesQuery);
    const cups = cupsAll.filter(matchesQuery);
    const defaultLeagues = defaultLeaguesAll.filter(matchesQuery);

    const isProAssinante = myClub?.time.assinante;

    const toSection = (
      title: string,
      subtitle: string | undefined,
      data: LeagueUserDetails[]
    ): SectionLeagueProps | null =>
      data.length > 0 ? { title, subtitle, data } : null;

    return [
      toSection(
        'Clássicas',
        query
          ? `${privateLeagues.length} de ${privateLeaguesAll.length} · ${privateLeaguesAll.length} / ${
              isProAssinante ? max_ligas_pro : max_ligas_free
            }`
          : `${privateLeaguesAll.length} / ${isProAssinante ? max_ligas_pro : max_ligas_free}`,
        privateLeagues
      ),
      toSection(
        'Mata-mata',
        query
          ? `${cups.length} de ${cupsAll.length} · ${cupsAll.length} / ${
              isProAssinante ? max_ligas_matamata_pro : max_ligas_matamata_free
            }`
          : `${cupsAll.length} / ${isProAssinante ? max_ligas_matamata_pro : max_ligas_matamata_free}`,
        cups
      ),
      !isMarketClose
        ? toSection(
            'Padrão',
            query ? `${defaultLeagues.length} de ${defaultLeaguesAll.length}` : `${defaultLeaguesAll.length}`,
            defaultLeagues
          )
        : null,
    ].filter((s): s is SectionLeagueProps => s !== null);
  }, [leagues, isMarketClose, marketStatus, myClub?.time.assinante, search]);

  const keyExtractor = useCallback((item: LeagueUserDetails) => `${item.liga_id}`, []);

  const renderItem = useCallback(({ item: league }: ListRenderItemInfo<LeagueUserDetails>) => {
    return <LeagueCard key={league.liga_id} league={league} myTeamId={myClub?.time?.time_id} />;
  }, [myClub?.time?.time_id]);

  const onRefetch = useCallback(async () => {
    Promise.allSettled([
      onRefetchMyClub && onRefetchMyClub(),
      onRefetchLeagues(),
      onRefetchInvites(),
      onRefetchPointsCompetitions(),
      onRefetchFinalizedCompetitions(),
    ]);
  }, [onRefetchInvites, onRefetchLeagues, onRefetchMyClub, onRefetchPointsCompetitions, onRefetchFinalizedCompetitions]);

  const isRefetching =
    isRefetchingMyClub || isRefetchingLeagues || isRefetchingInvites ||
    isRefetchingPointsCompetitions || isRefetchingFinalizedCompetitions;

  if (!isAutheticated) {
    return <Login title="Para acessar suas ligas, é necessário efetuar o login." />;
  }

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.EM_MANUTENCAO) {
    return <MaintenanceMarket hasHeader />;
  }

  if (!leagues || !myClub || isLoadingInvites) {
    return <LoadingScreen title="Carregando minhas ligas" />;
  }

  const pointsList = pointsCompetitions ?? [];
  const pointsQuery = search.trim().toLowerCase();
  const pointsFiltered =
    pointsQuery.length > 0
      ? pointsList.filter((c) => c.nome.toLowerCase().includes(pointsQuery))
      : pointsList;

  const finalizedList = finalizedCompetitions ?? [];
  const finalizedFiltered =
    pointsQuery.length > 0
      ? finalizedList.filter((c) => c.nome.toLowerCase().includes(pointsQuery))
      : finalizedList;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        style={{
          flex: 1,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        {/* Header (fixo) */}
        <View className="px-2 pt-3 pb-2" style={{ gap: 10, backgroundColor: 'transparent' }}>
          <View style={{ backgroundColor: 'transparent', gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View
              className="flex-row items-center rounded-xl px-3 flex-1"
              style={{
                gap: 10,
                height: 48,
                backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Feather name="search" size={18} color={colorTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar liga..."
                placeholderTextColor={colorTheme === 'dark' ? '#6b7280' : '#9ca3af'}
                style={{
                  flex: 1,
                  color: colorTheme === 'dark' ? '#f9fafb' : '#111827',
                  fontSize: 15,
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/leagues/invites')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Feather
                name="mail"
                size={16}
                color={colorTheme === 'dark' ? '#e5e7eb' : '#111827'}
              />
              <Text className="text-sm font-semibold">Convites</Text>
              {invitesCount > 0 && (
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#ef4444' }}>
                  <Text className="text-xs font-bold" style={{ color: '#ffffff' }}>
                    {invitesCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <SectionList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          sections={sectionLeaguesList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10, backgroundColor: 'transparent' }} />}
          ListHeaderComponent={
            pointsFiltered.length > 0 ? (
              <View style={{ paddingBottom: 8, backgroundColor: 'transparent' }}>
                <View
                  className="py-3"
                  style={{
                    backgroundColor:
                      colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
                  }}>
                  <View
                    className="flex-row items-end justify-between"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="font-bold text-base">Pontos Corridos</Text>
                    <Text className="text-xs text-gray-500">
                      {pointsFiltered.length}
                      {pointsQuery ? ` de ${pointsList.length}` : ''}
                    </Text>
                  </View>
                </View>
                <View style={{ gap: 10, backgroundColor: 'transparent' }}>
                  {pointsFiltered.map((competition) => (
                    <PointsCompetitionCard key={competition.slug} competition={competition} myTeamId={myClub?.time?.time_id} />
                  ))}
                </View>
              </View>
            ) : null
          }
          contentContainerStyle={{
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
            paddingHorizontal: 8,
            paddingBottom: 16,
          }}
          renderSectionHeader={({ section: { title, subtitle } }) => (
            <View
              className="py-3"
              style={{
                backgroundColor:
                  colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
              }}>
              <View
                className="flex-row items-end justify-between"
                style={{ backgroundColor: 'transparent' }}>
                <Text className="font-bold text-base">{title}</Text>
                {subtitle && (
                  <Text className="text-xs text-gray-500">{subtitle}</Text>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={<EmptyLeagueList />}
          stickySectionHeadersEnabled={false}
          ListFooterComponent={
            finalizedFiltered.length > 0 ? (
              <View style={{ paddingTop: 8, backgroundColor: 'transparent' }}>
                <View
                  className="py-3"
                  style={{
                    backgroundColor:
                      colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
                  }}>
                  <View
                    className="flex-row items-end justify-between"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="font-bold text-base">Finalizadas</Text>
                    <Text className="text-xs text-gray-500">{finalizedFiltered.length}</Text>
                  </View>
                </View>
                <View style={{ gap: 10, backgroundColor: 'transparent' }}>
                  {finalizedFiltered.map((competition) => (
                    <TouchableOpacity
                      key={competition.slug}
                      activeOpacity={0.7}
                      onPress={() => router.push(`/leagues/points/${competition.slug}`)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                        borderWidth: 1,
                        borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
                      }}>
                      {competition.url_taca_png ? (
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Image
                            source={{ uri: competition.url_taca_png }}
                            style={{ width: 48, height: 48, borderRadius: 24 }}
                          />
                        </View>
                      ) : null}
                      <View style={{ flex: 1, backgroundColor: 'transparent', gap: 4 }}>
                        <Text className="text-base font-bold" numberOfLines={1}>
                          {competition.nome}
                        </Text>
                        <Text className="text-xs text-gray-500" numberOfLines={1}>
                          {competition.privacidade === 'A' ? 'Aberta' : 'Fechada'} ·{' '}
                          {competition.quantidade_participantes} times · Rd{' '}
                          {competition.rodada_inicial}–{competition.rodada_final}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 6,
                            backgroundColor: 'transparent',
                            flexWrap: 'wrap',
                          }}>
                          <View
                            className="px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#e5e7eb',
                            }}>
                            <Text className="text-[11px] font-semibold" style={{ color: '#9ca3af' }}>
                              Finalizada
                            </Text>
                          </View>
                          <View
                            className="px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: colorTheme === 'dark' ? '#1f2937' : '#e5e7eb',
                            }}>
                            <Text className="text-[11px] font-semibold" style={{ color: '#f59e0b' }}>
                              #{competition.ranking_time.posicao}º lugar
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color={colorTheme === 'dark' ? '#6b7280' : '#9ca3af'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaViewContainer>
  );
}

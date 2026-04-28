import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useMemo } from 'react';
import { Image, RefreshControl } from 'react-native';

import { Text, View } from '@/components/Themed';
import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { CupTeamsList } from '@/components/contexts/leagues/Cup/CupTeamsList';
import { Loading } from '@/components/structure/Loading';
import { ITab, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CupMatch, League } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';
import { useGetAppreciations } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';

const STAGE_TYPE_NAMED: Record<string, string> = {
  P: 'Primeira Fase',
  O: 'Oitavas',
  Q: 'Quartas',
  S: 'Semi-final',
  F: 'Final',
  T: '3º Lugar',
};

interface CupProps {
  league: League;
}

export function Cup({ league: cup }: CupProps) {
  const colorTheme = useThemeColor();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { data: myClub, isLoading: isLoadingMyClub } = useGetMyClub();

  const { data: playerStats, refetch: onRefetchStats } = useGetScoredPlayers(isMarketClose);

  const { refetch: onRefetchValorizations } = useGetAppreciations(isMarketClose);

  const {
    isCupInProgress,
    totalTeamCup,
    currentTeamsCup,
    clubsByLeague,
    onRefetchLeague,
    isRefetchingLeague,
  } = useLeague({
    slug: cup.liga.slug,
  });

  const partialsByTeamId = useMemo(() => {
    if (!isMarketClose || !playerStats?.atletas || !clubsByLeague) return {};

    const useCaptainScore = !cup.liga.sem_capitao;
    const result: Record<number, { partialScore: number; playersPlayed: number }> = {};

    Object.entries(clubsByLeague).forEach(([teamIdStr, data]) => {
      const teamId = Number(teamIdStr);
      const athletes = data?.atletas ?? [];
      const captainId = data?.capitao ? Number(data.capitao) : 0;

      const points = athletes.reduce((acc, athleteId) => {
        const p = playerStats.atletas[String(athleteId)];
        return acc + (p?.pontuacao ?? 0);
      }, 0);

      const captainPoints = playerStats.atletas[String(captainId)]?.pontuacao ?? 0;
      const total = points + (useCaptainScore ? captainPoints * 0.5 : 0);

      const playersPlayed = athletes.reduce((acc, athleteId) => {
        return acc + (playerStats.atletas[String(athleteId)] ? 1 : 0);
      }, 0);

      result[teamId] = { partialScore: total, playersPlayed };
    });

    return result;
  }, [clubsByLeague, cup.liga.sem_capitao, isMarketClose, playerStats?.atletas]);

  const renderCupMatchCard = useCallback(
    ({ item }: ListRenderItemInfo<CupMatch>) => {
      return (
        <CupMatchCard
          match={item}
          myTeam={myClub}
          leagueSlug={cup.liga.slug}
          currentRound={marketStatus?.rodada_atual}
          isMarketClose={isMarketClose}
          partialsByTeamId={partialsByTeamId}
        />
      );
    },
    [cup.liga.slug, isMarketClose, marketStatus?.rodada_atual, myClub, partialsByTeamId]
  );

  const onRefetch = useCallback(async () => {
    await Promise.allSettled([onRefetchLeague(), onRefetchStats(), onRefetchValorizations()]);
  }, [onRefetchLeague, onRefetchStats, onRefetchValorizations]);

  const isRefetching = isRefetchingLeague;

  const renderItem = useCallback(
    (round: string) => {
      return (
        <FlashList
          refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />}
          data={cup.chaves_mata_mata ? cup.chaves_mata_mata[round] : []}
          keyExtractor={(item) => `${item.chave_id}`}
          ItemSeparatorComponent={() => (
            <View className={`h-2 ${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'}`} />
          )}
          renderItem={renderCupMatchCard}
          contentContainerStyle={{
            paddingTop: 8,
            paddingHorizontal: 8,
            paddingBottom: 8,
          }}
        />
      );
    },
    [colorTheme, cup, isRefetching, onRefetch, renderCupMatchCard]
  );

  const roundTabs: ITab[] | undefined = useMemo(() => {
    if (isCupInProgress && cup && cup.chaves_mata_mata) {
      return Object.keys(cup.chaves_mata_mata).map((round) => {
        const matches = cup.chaves_mata_mata![round] ?? [];
        const phase = matches[0]?.tipo_fase ?? 'Q';
        return {
          id: Number(round),
          title: STAGE_TYPE_NAMED[phase] ?? round,
          content: () => renderItem(round),
        };
      });
    }
    return [];
  }, [cup, isCupInProgress, renderItem]);

  const isLoading = isCupInProgress ? isLoadingMyClub || roundTabs?.length < 1 : isLoadingMyClub;

  if (isLoading || !cup || !marketStatus || !renderItem) return <Loading />;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}>
      <View
        className="mx-2 mb-4 mt-2 rounded-xl flex-row items-center"
        style={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <View
          className="rounded-xl flex-row items-center p-3"
          style={{
            gap: 12,
            backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
          }}>
          {cup?.liga.url_trofeu_png ? (
            <Image
              source={{ uri: cup.liga.url_trofeu_png }}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          ) : null}

          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
              }}>
              <View style={{ alignItems: 'center', gap: 2, backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs"
                  style={{ color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                  Início
                </Text>
                <Text className="font-bold text-sm">
                  {format(new Date(cup?.liga.data_inicio as string), 'dd/MM', { locale: ptBR })}
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                  Rodada {cup?.liga.inicio_rodada}
                </Text>
              </View>

              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                }}>
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                  —
                </Text>
              </View>

              <View style={{ alignItems: 'center', gap: 2, backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs"
                  style={{ color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                  Final
                </Text>
                <Text className="font-bold text-sm">
                  {format(new Date(cup?.liga.data_fim as string), 'dd/MM', { locale: ptBR })}
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                  Rodada {cup?.liga.fim_rodada}
                </Text>
              </View>

              <View style={{ alignItems: 'center', gap: 2, backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs"
                  style={{ color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                  Cartoleiros
                </Text>
                <Text className="font-bold text-xl">
                  {!isMarketClose ? `${currentTeamsCup} / ${totalTeamCup}` : `${totalTeamCup}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {!isCupInProgress ? <CupTeamsList cup={cup} /> : <Tabs tabs={roundTabs} variant="pill" />}
    </View>
  );
}

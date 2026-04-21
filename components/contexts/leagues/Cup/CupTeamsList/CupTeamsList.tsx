import { Feather } from '@expo/vector-icons';
import { useCallback } from 'react';
import { FlatList, Image, ListRenderItemInfo, RefreshControl } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useLeague, { TeamCup } from '@/hooks/useLeague';
import { useThemeColor } from '@/hooks/useThemeColor';
import { League } from '@/models/Leagues';

type CupTeamsListProps = {
  cup: League;
};

type SlotItem =
  | { type: 'team'; data: TeamCup; index: number }
  | { type: 'empty'; index: number };

export function CupTeamsList({ cup }: CupTeamsListProps) {
  const colorTheme = useThemeColor();
  const isDark = colorTheme === 'dark';

  const {
    onRefetchLeague,
    isRefetchingLeague,
    isCupInProgress,
    teamsAwatingAcceptInvite,
    teamsByCup,
    totalTeamCup,
  } = useLeague({ slug: cup.liga.slug });

  const confirmedCount = teamsByCup.length;
  const pendingCount = teamsAwatingAcceptInvite?.length ?? 0;
  const totalSlots = totalTeamCup ?? cup.liga.quantidade_times ?? 0;
  const filledSlots = confirmedCount + pendingCount;
  const emptySlots = Math.max(0, totalSlots - filledSlots);
  const isReadyForDraw = filledSlots === totalSlots && totalSlots > 0;

  const allTeams: TeamCup[] =
    teamsAwatingAcceptInvite && teamsAwatingAcceptInvite.length > 0
      ? [...teamsByCup, ...teamsAwatingAcceptInvite]
      : [...teamsByCup];

  const slots: SlotItem[] = [
    ...allTeams.map((t, i) => ({ type: 'team' as const, data: t, index: i })),
    ...Array.from({ length: emptySlots }, (_, i) => ({
      type: 'empty' as const,
      index: filledSlots + i,
    })),
  ];

  const renderTeamCard = (item: TeamCup, seed: number) => {
    const isPending = !!item.isPending;

    const cardBg = isPending
      ? isDark ? '#422006' : '#fffbeb'
      : isDark ? '#052e16' : '#f0fdf4';

    const borderColor = isPending
      ? isDark ? '#92400e' : '#fde68a'
      : isDark ? '#14532d' : '#bbf7d0';

    const seedBg = isPending
      ? isDark ? '#78350f' : '#fef3c7'
      : isDark ? '#166534' : '#dcfce7';

    const seedColor = isPending
      ? isDark ? '#fbbf24' : '#b45309'
      : isDark ? '#4ade80' : '#15803d';

    return (
      <View
        style={{
          flex: 1,
          margin: 5,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: cardBg,
          overflow: 'hidden',
        }}>
        {/* Seed badge */}
        <View
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: seedBg,
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
            zIndex: 1,
          }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: seedColor }}>
            #{seed + 1}
          </Text>
        </View>

        {/* Pending badge */}
        {isPending && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: isDark ? '#92400e' : '#fef3c7',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              zIndex: 1,
            }}>
            <Feather name="clock" size={9} color={isDark ? '#fbbf24' : '#b45309'} />
            <Text style={{ fontSize: 9, fontWeight: '600', color: isDark ? '#fbbf24' : '#b45309' }}>
              Aguardando
            </Text>
          </View>
        )}

        {/* Content */}
        <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 14, paddingHorizontal: 8, backgroundColor: 'transparent', gap: 6 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isDark ? '#ffffff10' : '#00000008',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={{ uri: item.url_escudo_png }}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
              alt={`Escudo ${item.nome}`}
            />
          </View>

          <View style={{ alignItems: 'center', backgroundColor: 'transparent', gap: 1 }}>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 12,
                fontWeight: '700',
                textAlign: 'center',
                lineHeight: 15,
                color: isDark ? '#f0fdf4' : '#14532d',
              }}>
              {item.nome}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 10,
                fontWeight: '400',
                textAlign: 'center',
                color: isDark ? '#86efac' : '#4d7c0f',
                opacity: 0.8,
              }}>
              {item.nome_cartola}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptySlot = (seed: number) => (
    <View
      style={{
        flex: 1,
        margin: 5,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: isDark ? '#1f2937' : '#e5e7eb',
        borderStyle: 'dashed',
        backgroundColor: isDark ? '#111827' : '#f9fafb',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 6,
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Feather name="user-plus" size={16} color={isDark ? '#4b5563' : '#9ca3af'} />
      </View>
      <Text style={{ fontSize: 10, color: isDark ? '#4b5563' : '#9ca3af', fontWeight: '500' }}>
        #{seed + 1} — Vaga livre
      </Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SlotItem>) => {
      if (item.type === 'team') return renderTeamCard(item.data, item.index);
      return renderEmptySlot(item.index);
    },
    [isDark, teamsByCup, teamsAwatingAcceptInvite]
  );

  const keyExtractor = useCallback(
    (item: SlotItem) =>
      item.type === 'team' ? `team-${item.data.time_id}` : `empty-${item.index}`,
    []
  );

  if (isCupInProgress) return null;

  return (
    <FlatList
      refreshControl={
        <RefreshControl onRefresh={onRefetchLeague} refreshing={isRefetchingLeague} />
      }
      data={slots}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={2}
      initialNumToRender={16}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: 'transparent', gap: 12 }}>
          {/* Status bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: isDark ? '#1f2937' : '#e5e7eb',
            }}>
            <View style={{ backgroundColor: 'transparent', gap: 2 }}>
              <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500' }}>
                Times confirmados
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: isDark ? '#f9fafb' : '#111827' }}>
                {confirmedCount}
                <Text style={{ fontSize: 14, fontWeight: '400', color: isDark ? '#6b7280' : '#9ca3af' }}>
                  /{totalSlots}
                </Text>
              </Text>
            </View>

            {/* Progress ring area */}
            <View style={{ alignItems: 'flex-end', backgroundColor: 'transparent', gap: 4 }}>
              {pendingCount > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: isDark ? '#422006' : '#fef3c7',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}>
                  <Feather name="clock" size={11} color={isDark ? '#fbbf24' : '#b45309'} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#fbbf24' : '#b45309' }}>
                    {pendingCount} aguardando
                  </Text>
                </View>
              )}
              {emptySlots > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}>
                  <Feather name="user-plus" size={11} color={isDark ? '#6b7280' : '#9ca3af'} />
                  <Text style={{ fontSize: 11, fontWeight: '500', color: isDark ? '#6b7280' : '#9ca3af' }}>
                    {emptySlots} vagas livres
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Progress bar */}
          {totalSlots > 0 && (
            <View style={{ backgroundColor: isDark ? '#1f2937' : '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  borderRadius: 4,
                  width: `${Math.min(100, (confirmedCount / totalSlots) * 100)}%`,
                  backgroundColor: isReadyForDraw ? '#22c55e' : isDark ? '#4ade80' : '#16a34a',
                }}
              />
              {pendingCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    height: '100%',
                    borderRadius: 4,
                    left: `${Math.min(100, (confirmedCount / totalSlots) * 100)}%` as any,
                    width: `${Math.min(100, (pendingCount / totalSlots) * 100)}%`,
                    backgroundColor: isDark ? '#f59e0b' : '#fbbf24',
                    opacity: 0.7,
                  }}
                />
              )}
            </View>
          )}

          {/* Ready for draw banner */}
          {isReadyForDraw && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: isDark ? '#052e16' : '#f0fdf4',
                borderRadius: 10,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: isDark ? '#14532d' : '#bbf7d0',
              }}>
              <Feather name="check-circle" size={15} color={isDark ? '#4ade80' : '#16a34a'} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#4ade80' : '#16a34a' }}>
                Todos os times confirmados — pronto para sorteio!
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#6b7280' : '#9ca3af', paddingTop: 4 }}>
            PARTICIPANTES
          </Text>
        </View>
      }
      contentContainerStyle={{
        backgroundColor: isDark ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        paddingHorizontal: 11,
        paddingBottom: 32,
      }}
    />
  );
}

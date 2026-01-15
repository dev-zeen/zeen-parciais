import { Feather } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useContext, useMemo } from 'react';
import {  FlatList, Image, ListRenderItemInfo, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetMyClub } from '@/queries/club.query';
import { useGetPointsCompetitionBySlug } from '@/queries/competitions.query';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function () {
  const colorTheme = useThemeColor();
  const { isAutheticated } = useContext(AuthContext);
  const { allowRequest } = useMarketStatus();
  const params = useLocalSearchParams();

  const slug = useMemo(() => {
    const raw = params.slug;
    return typeof raw === 'string' ? raw : '';
  }, [params.slug]);

  const { data } = useGetPointsCompetitionBySlug(slug, allowRequest);
  // Precisamos do /auth/time para descobrir se o usuário é dono da liga.
  // Não depende do marketStatus (allowRequest) e pode ser carregado assim que estiver autenticado.
  const { data: myClub } = useGetMyClub(!!isAutheticated);

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  if (!data) return <LoadingScreen title="Carregando liga (Pontos Corridos)" />;

  const participants = Object.values(data.participantes ?? {});
  const invited = Object.values(data.convidados ?? {});
  const isOwner = (myClub?.time?.time_id ?? 0) === data.time_dono_id;
  const canInvite = isOwner;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        className="flex-1"
        style={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        {/* Header */}
        <View className="px-4 pt-3 pb-2" style={{ gap: 10, backgroundColor: 'transparent' }}>
          <View
            className="flex-row items-center justify-between"
            style={{ backgroundColor: 'transparent' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Feather name="chevron-left" size={20} color={colorTheme === 'dark' ? '#e5e7eb' : '#111827'} />
            </TouchableOpacity>

            <View style={{ flex: 1, paddingHorizontal: 12, backgroundColor: 'transparent' }}>
              <Text className="text-xl font-extrabold" numberOfLines={1}>
                {data.nome}
              </Text>
              <Text className="text-xs text-gray-500">
                {data.quantidade_participantes} / {data.quantidade_times} participantes ·{' '}
                {data.privacidade === 'A' ? 'Aberta' : 'Fechada'}
              </Text>
            </View>

            {canInvite && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/leagues/create/invite',
                    params: { type: 'points', slug: data.slug },
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
          </View>

        </View>

        <FlatList
          data={[{ key: 'participants' }, { key: 'invited' }]}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isParticipants = item.key === 'participants';
            const list = isParticipants ? participants : invited;
            const title = isParticipants ? 'Participantes' : 'Convidados';

            return (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'transparent' }}>
                <View
                  className="flex-row items-end justify-between"
                  style={{ backgroundColor: 'transparent', paddingBottom: 8 }}>
                  <Text className="font-bold text-base">{title}</Text>
                  <Text className="text-xs text-gray-500">{list.length}</Text>
                </View>

                {list.length === 0 ? (
                  <View
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                      borderWidth: 1,
                      borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
                    }}>
                    <Text className="text-sm text-gray-500">Nenhum item.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={list}
                    keyExtractor={(t) => `${t.time_id}`}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={{ height: 10, backgroundColor: 'transparent' }} />}
                    renderItem={({ item: team, index }: ListRenderItemInfo<(typeof list)[number]>) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push(`/leagues/club/${team.time_id}`)}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
                          borderWidth: 1,
                          borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                        }}>
                        <Text className="text-sm font-semibold" style={{ width: 32 }}>
                          {index + 1}
                        </Text>
                        <Image
                          source={{ uri: team.url_escudo_png }}
                          style={{ width: 40, height: 40, borderRadius: 20 }}
                          alt={`Escudo ${team.nome}`}
                        />
                        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                          <Text className="font-bold" numberOfLines={1}>
                            {team.nome}
                          </Text>
                          <Text className="text-xs text-gray-500" numberOfLines={1}>
                            {team.nome_cartola}
                          </Text>
                        </View>
                        {team.assinante && (
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 12,
                              backgroundColor: '#fbbf2420',
                            }}>
                            <Text className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                              PRO
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            );
          }}
          contentContainerStyle={{
            paddingBottom: 16,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
        />
      </View>
    </SafeAreaViewContainer>
  );
}


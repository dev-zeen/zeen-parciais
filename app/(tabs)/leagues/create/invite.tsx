import { Feather } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { 
  Alert,
  FlatList,
  Image,
  ListRenderItemInfo,
  TextInput,
  TouchableOpacity } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import Colors from '@/constants/Colors';
import {
  GET_LEAGUE_BY_SLUG,
  GET_POINTS_COMPETITION_BY_SLUG,
} from '@/constants/Endpoits';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { invitePointsCompetition } from '@/queries/competitions.mutations';
import { inviteLeague } from '@/queries/leagues.mutations';
import { SearchTeamItem, useSearchTeams } from '@/queries/teams.query';
import { useThemeColor } from '@/hooks/useThemeColor';

type InviteType = 'classic' | 'matamata' | 'points';

export default function () {
  const colorTheme = useThemeColor();
  const { isAutheticated } = useContext(AuthContext);
  const { allowRequest } = useMarketStatus();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const slug = useMemo(() => {
    const raw = params.slug;
    return typeof raw === 'string' ? raw : '';
  }, [params.slug]);

  const type = useMemo<InviteType>(() => {
    const raw = params.type;
    if (raw === 'classic' || raw === 'matamata' || raw === 'points') return raw;
    return 'classic';
  }, [params.type]);

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const [selectedSlugs, setSelectedSlugs] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data: teams, isFetching } = useSearchTeams(debouncedQ, allowRequest);

  const selectedTeamIds = useMemo(() => {
    return Object.keys(selectedIds)
      .filter((k) => selectedIds[Number(k)])
      .map((k) => Number(k));
  }, [selectedIds]);

  const selectedTeamSlugs = useMemo(() => {
    return Object.keys(selectedSlugs).filter((k) => selectedSlugs[k]);
  }, [selectedSlugs]);

  const title = useMemo(() => {
    if (type === 'points') return 'Convidar (Pontos Corridos)';
    if (type === 'matamata') return 'Convidar (Mata-mata)';
    return 'Convidar (Clássica)';
  }, [type]);

  const toggleTeam = useCallback(
    (team: SearchTeamItem) => {
      if (type === 'points') {
        setSelectedIds((prev) => {
          const isOn = !!prev[team.time_id];
          return { ...prev, [team.time_id]: !isOn };
        });
        return;
      }

      setSelectedSlugs((prev) => {
        const isOn = !!prev[team.slug];
        return { ...prev, [team.slug]: !isOn };
      });
    },
    [type]
  );

  const onSubmit = useCallback(async () => {
    if (!slug) return;
    const hasSelection = type === 'points' ? selectedTeamIds.length > 0 : selectedTeamSlugs.length > 0;

    if (!hasSelection) {
      Alert.alert('Selecione times', 'Escolha pelo menos 1 time para convidar.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (type === 'points') {
        await invitePointsCompetition(slug, selectedTeamIds);
        // Invalidate points competition detail query
        await queryClient.invalidateQueries({
          queryKey: [GET_POINTS_COMPETITION_BY_SLUG.replace(':slug', slug)],
        });
      } else {
        await inviteLeague(slug, selectedTeamSlugs);
        // Invalidate league detail query
        await queryClient.invalidateQueries({
          queryKey: [GET_LEAGUE_BY_SLUG.replace(':slug', slug)],
        });
      }

      Alert.alert('Tudo certo!', 'Convites enviados.');
      setSelectedIds({});
      setSelectedSlugs({});
    } catch (err: any) {
      const msg =
        typeof err?.response?.data?.mensagem === 'string'
          ? err.response.data.mensagem
          : 'Não foi possível enviar os convites.';
      Alert.alert('Alerta!', msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTeamIds, selectedTeamSlugs, slug, type, queryClient]);

  const keyExtractor = useCallback((item: SearchTeamItem) => `${item.time_id}`, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SearchTeamItem>) => {
      const isSelected = type === 'points' ? !!selectedIds[item.time_id] : !!selectedSlugs[item.slug];
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleTeam(item)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isSelected ? '#22c55e' : colorTheme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          <Image
            source={{ uri: item.url_escudo_png }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colorTheme === 'dark' ? '#111827' : '#f3f4f6',
            }}
            alt={`Escudo ${item.nome}`}
          />
          <View style={{ backgroundColor: 'transparent', flex: 1, gap: 2 }}>
            <Text className="font-bold" numberOfLines={1}>
              {item.nome}
            </Text>
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {item.nome_cartola}
            </Text>
          </View>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isSelected ? '#22c55e' : 'transparent',
              borderWidth: 1,
              borderColor: isSelected ? '#22c55e' : colorTheme === 'dark' ? '#374151' : '#e5e7eb',
            }}>
            {isSelected && <Feather name="check" size={16} color="#ffffff" />}
          </View>
        </TouchableOpacity>
      );
    },
    [colorTheme, selectedIds, selectedSlugs, toggleTeam, type]
  );

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;
  if (!slug) return <LoadingScreen title="Carregando convite..." />;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <View
        className="flex-1"
        style={{
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
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
              <Text className="text-xl font-extrabold">{title}</Text>
              <Text className="text-xs text-gray-500">
                {type === 'points' ? selectedTeamIds.length : selectedTeamSlugs.length} selecionado(s)
              </Text>
            </View>
          </View>

          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              gap: 10,
              height: 48,
              backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
            }}>
            <Feather name="search" size={18} color={colorTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Buscar time..."
              placeholderTextColor={colorTheme === 'dark' ? '#6b7280' : '#9ca3af'}
              style={{
                flex: 1,
                color: colorTheme === 'dark' ? '#f9fafb' : '#111827',
                fontSize: 15,
              }}
            />
          </View>
        </View>

        <FlatList
          data={teams ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 80,
            gap: 10,
            backgroundColor:
              colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          }}
          ListEmptyComponent={
            q.trim().length < 2 ? (
              <View style={{ padding: 16, backgroundColor: 'transparent' }}>
                <Text className="text-sm text-gray-500">Digite ao menos 2 letras para buscar.</Text>
              </View>
            ) : isFetching ? (
              <View style={{ padding: 16, backgroundColor: 'transparent' }}>
                <Text className="text-sm text-gray-500">Buscando...</Text>
              </View>
            ) : (
              <View style={{ padding: 16, backgroundColor: 'transparent' }}>
                <Text className="text-sm text-gray-500">Nenhum time encontrado.</Text>
              </View>
            )
          }
        />

        {/* Fixed Bottom Action Buttons */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
            borderTopWidth: 1,
            borderTopColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}>
          <View style={{ flexDirection: 'row', gap: 12, backgroundColor: 'transparent' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
              }}>
              <Text className="font-semibold" style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSubmit}
              disabled={
                isSubmitting ||
                (type === 'points' ? selectedTeamIds.length === 0 : selectedTeamSlugs.length === 0)
              }
              style={{
                flex: 2,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  isSubmitting ||
                  (type === 'points' ? selectedTeamIds.length === 0 : selectedTeamSlugs.length === 0)
                    ? colorTheme === 'dark' ? '#1f2937' : '#f3f4f6'
                    : '#22c55e',
                flexDirection: 'row',
                gap: 8,
              }}>
              {isSubmitting ? (
                <Feather name="loader" size={18} color="#ffffff" />
              ) : (
                (type === 'points' ? selectedTeamIds.length > 0 : selectedTeamSlugs.length > 0) && (
                  <View
                    style={{
                      backgroundColor: '#ffffff20',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}>
                    <Text className="text-xs font-bold" style={{ color: '#ffffff' }}>
                      {type === 'points' ? selectedTeamIds.length : selectedTeamSlugs.length}
                    </Text>
                  </View>
                )
              )}
              <Text
                className="font-semibold"
                style={{
                  color:
                    isSubmitting ||
                    (type === 'points' ? selectedTeamIds.length === 0 : selectedTeamSlugs.length === 0)
                      ? '#9ca3af'
                      : '#ffffff',
                }}>
                {isSubmitting ? 'Enviando...' : 'Enviar convites'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaViewContainer>
  );
}


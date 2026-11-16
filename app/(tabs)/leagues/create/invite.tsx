import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEAGUE_KIND } from '@/components/contexts/leagues/leagueKinds';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { SearchField } from '@/components/ui/SearchField';
import { StateView } from '@/components/ui/StateView';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import { useInvitePointsCompetition } from '@/queries/competitions.mutations';
import { useInviteLeague } from '@/queries/leagues.mutations';
import { SearchTeamItem, useSearchTeams } from '@/queries/teams.query';
import { haptics } from '@/utils/haptics';
import { appAlert } from '@/components/ui/AppAlert';

type InviteType = 'classic' | 'matamata' | 'points';

const MIN_QUERY = 2;

/**
 * Convidar times (dono da liga). Pontos corridos convida por id; clássica e mata-mata por
 * slug, como a API espera. A seleção é guardada pelo time inteiro para mostrar o resumo.
 */
export default function InviteTeamsScreen() {
  const { colors, spacing, radius, minTouch } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const insets = useSafeAreaInsets();
  const { isAutheticated } = useContext(AuthContext);
  const { allowRequest } = useMarketStatus();
  const params = useLocalSearchParams<{ slug?: string; type?: string }>();

  const slug = params.slug ?? '';
  const type: InviteType =
    params.type === 'matamata' || params.type === 'points' ? params.type : 'classic';
  const kind = LEAGUE_KIND[type === 'points' ? 'points' : type === 'matamata' ? 'cup' : 'classic'];

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selected, setSelected] = useState<Map<number, SearchTeamItem>>(new Map());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: teams, isFetching, isError } = useSearchTeams(debouncedQuery, allowRequest);

  const onSent = () => {
    haptics.success();
    const count = selected.size;
    setSelected(new Map());
    appAlert(
      'Convites enviados',
      `${count} ${count === 1 ? 'time foi convidado' : 'times foram convidados'}. Eles aparecem como "Aguardando" até aceitarem.`
    );
  };
  const onFailed = (message?: string) => {
    haptics.error();
    appAlert(
      'Convites não enviados',
      typeof message === 'string' ? message : 'Confira a conexão e tente de novo.'
    );
  };

  const invitePoints = useInvitePointsCompetition({
    onSuccess: onSent,
    onError: (error) => onFailed(error?.response?.data?.mensagem),
  });
  const inviteLeague = useInviteLeague({
    onSuccess: onSent,
    onError: (error) => onFailed(error?.response?.data?.mensagem),
  });
  const isSubmitting = invitePoints.isPending || inviteLeague.isPending;

  const toggle = useCallback((team: SearchTeamItem) => {
    haptics.selection();
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(team.time_id)) next.delete(team.time_id);
      else next.set(team.time_id, team);
      return next;
    });
  }, []);

  const submit = () => {
    if (!slug || selected.size === 0 || isSubmitting) return;
    const list = [...selected.values()];
    if (type === 'points') {
      invitePoints.mutate({ slug, teamIds: list.map((team) => team.time_id) });
    } else {
      inviteLeague.mutate({ slug, teamSlugs: list.map((team) => team.slug) });
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<SearchTeamItem>) => {
    const isSelected = selected.has(item.time_id);
    return (
      <Pressable
        onPress={() => toggle(item)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${item.nome}, de ${item.nome_cartola}`}
        android_ripple={{ color: colors.border }}
        style={({ pressed }) => [
          styles.row,
          {
            gap: spacing.sm,
            padding: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: isSelected ? colors.accentContainer : colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <Image
          source={{ uri: item.url_escudo_png }}
          style={[styles.shield, { backgroundColor: colors.surfaceAlt }]}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="body" weight="bold" numberOfLines={1}>
            {item.nome}
          </AppText>
          <AppText variant="label" color="textMuted" numberOfLines={1}>
            {item.nome_cartola}
          </AppText>
        </View>
        <View
          style={[
            styles.check,
            {
              backgroundColor: isSelected ? colors.accentFill : 'transparent',
              borderColor: isSelected ? colors.accentFill : colors.border,
            },
          ]}>
          {isSelected ? <Feather name="check" size={16} color={colors.onAccentFill} /> : null}
        </View>
      </Pressable>
    );
  };

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  const hasQuery = query.trim().length >= MIN_QUERY;
  const footerHeight = minTouch + spacing.md * 2;

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader
        title="Convidar times"
        subtitle={`${kind.label} · ${
          selected.size
            ? `${selected.size} selecionado${selected.size > 1 ? 's' : ''}`
            : 'busque pelo nome do time'
        }`}
      />
      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xs }}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Nome do time"
          accessibilityLabel="Buscar time para convidar"
        />
      </View>

      <FlatList
        data={hasQuery ? (teams ?? []) : []}
        keyExtractor={(item) => `${item.time_id}`}
        renderItem={renderItem}
        extraData={selected}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: footerHeight + tabBarSpacing.contentBottom,
        }}
        ListEmptyComponent={
          !hasQuery ? (
            <StateView
              icon="search"
              title="Encontre times para convidar"
              message={`Digite pelo menos ${MIN_QUERY} letras do nome do time.`}
            />
          ) : isFetching || query !== debouncedQuery ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.textMuted} />
          ) : isError ? (
            <StateView
              icon="wifi-off"
              title="A busca falhou"
              message="Confira a conexão e tente de novo."
            />
          ) : (
            <StateView
              icon="user-x"
              title="Nenhum time encontrado"
              message="Confira o nome do time (não o do cartoleiro)."
            />
          )
        }
      />

      {/* Barra fixa acima da tab bar */}
      <View
        style={[
          styles.footer,
          {
            bottom: tabBarSpacing.overlap,
            gap: spacing.xs,
            padding: spacing.md,
            paddingBottom:
              spacing.md + (Platform.OS === 'ios' && !tabBarSpacing.overlap ? insets.bottom : 0),
            backgroundColor: colors.bg,
            borderTopColor: colors.border,
          },
        ]}>
        <Pressable
          onPress={submit}
          disabled={selected.size === 0 || isSubmitting}
          accessibilityRole="button"
          accessibilityState={{ disabled: selected.size === 0 || isSubmitting, busy: isSubmitting }}
          android_ripple={{ color: colors.border }}
          style={({ pressed }) => [
            styles.submit,
            {
              minHeight: minTouch,
              borderRadius: radius.full,
              backgroundColor: selected.size ? colors.accentFill : colors.disabledFill,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.onAccentFill} />
          ) : (
            <AppText
              variant="body"
              weight="bold"
              color={selected.size ? 'onAccentFill' : 'onDisabledFill'}>
              {selected.size
                ? `Enviar ${selected.size} ${selected.size === 1 ? 'convite' : 'convites'}`
                : 'Selecione times'}
            </AppText>
          )}
        </Pressable>
      </View>
    </SafeAreaViewContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shield: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  submit: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

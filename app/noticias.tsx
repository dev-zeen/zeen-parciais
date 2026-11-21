import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { SegmentOption, SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateView } from '@/components/ui/StateView';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
import { NewsItem, NewsSource } from '@/models/News';
import { useGetNews } from '@/queries/news.query';

const SOURCES: SegmentOption<NewsSource>[] = [
  { value: 'cartola', label: 'Cartola' },
  { value: 'gatomestre', label: 'Gato Mestre' },
];

const keyExtractor = (item: NewsItem) => item.url;

export default function NewsScreen() {
  const { spacing } = useTokens();
  const { allowRequest } = useMarketStatus();
  const [source, setSource] = useState<NewsSource>('cartola');
  const { data, isLoading, isError, refetch, isRefetching } = useGetNews(source, !!allowRequest);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NewsItem>) => <NewsRow item={item} />,
    []
  );

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader title="Dicas e notícias" />

      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xs }}>
        <SegmentedControl options={SOURCES} value={source} onChange={setSource} />
      </View>

      {isLoading ? (
        <LoadingScreen title="Carregando notícias" />
      ) : isError && !data ? (
        <StateView
          icon="wifi-off"
          title="Não deu para carregar as notícias"
          message="Confira a conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={() => {
            refetch();
          }}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.xs, gap: spacing.xs, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
            />
          }
          ListEmptyComponent={<StateView icon="file-text" title="Sem notícias por enquanto" />}
        />
      )}
    </SafeAreaViewContainer>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  const { colors, spacing, radius, minTouch } = useTokens();

  return (
    <Pressable
      onPress={() => {
        WebBrowser.openBrowserAsync(item.url).catch(() => {});
      }}
      accessibilityRole="link"
      accessibilityLabel={item.titulo}
      accessibilityHint="Abre a notícia no navegador"
      style={({ pressed }) => [
        styles.row,
        {
          minHeight: minTouch,
          gap: spacing.sm,
          padding: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {item.thumbnail ? (
        <Image
          source={{ uri: item.thumbnail }}
          style={[styles.thumb, { borderRadius: radius.sm, backgroundColor: colors.surfaceAlt }]}
          accessible={false}
        />
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="body" weight="bold" numberOfLines={3}>
          {item.titulo}
        </AppText>
        {item.subtitulo ? (
          <AppText variant="label" color="textMuted" numberOfLines={2}>
            {item.subtitulo}
          </AppText>
        ) : null}
      </View>
      <Feather name="external-link" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 72,
    height: 54,
  },
});

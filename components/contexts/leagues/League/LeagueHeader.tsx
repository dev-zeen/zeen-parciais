import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, LayoutAnimation, Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager } from 'react-native';

import { Text, View } from '@/components/Themed';
import { HighlightCard } from '@/components/contexts/leagues/League/HighlightCard';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { League as LeagueModel, LeagueUserDetails } from '@/models/Leagues';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const HIGHLIGHTS = [
  { key: 'rodada', label: 'Craque da Rodada' },
  { key: 'patrimonio', label: 'Maior Patrimônio' },
  { key: 'lanterninha', label: 'Lanterninha' },
] as const;

interface LeagueHeaderProps {
  liga: LeagueUserDetails;
  destaques: LeagueModel['destaques'];
}

export function LeagueHeader({ liga, destaques }: LeagueHeaderProps) {
  const colorTheme = useThemeColor();
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const borderColor = colorTheme === 'dark' ? '#2D3748' : '#E2E8F0';
  const bg = colorTheme === 'dark' ? Colors.dark.background : Colors.light.background;
  const metaColor = colorTheme === 'dark' ? '#9CA3AF' : '#6B7280';

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor }]}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggle} style={styles.header}>
        <Image source={{ uri: liga.url_flamula_png }} style={styles.pennant} resizeMode="contain" />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {liga.nome}
          </Text>
          <Text style={[styles.meta, { color: metaColor }]}>{liga.total_times_liga} times</Text>
          <Text style={[styles.meta, { color: metaColor }]}>
            Rodada {liga.inicio_rodada} até {liga.fim_rodada ?? '38'}
          </Text>
        </View>

        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={metaColor}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {expanded && destaques && (
        <View style={[styles.highlightsWrapper, { borderTopColor: borderColor }]}>
          <Text style={[styles.highlightsTitle, { color: metaColor }]}>Destaques</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightsScroll}>
            {HIGHLIGHTS.map(({ key, label }) => {
              const team = destaques[key];
              return team ? <HighlightCard key={key} label={label} team={team} /> : null;
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  pennant: {
    width: 48,
    height: 64,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  chevron: {
    alignSelf: 'center',
  },
  highlightsWrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
  },
  highlightsTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightsScroll: {
    gap: 8,
  },
});

import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { OrderByOptions } from '@/utils/leagues';

interface Tab {
  label: string;
  value: OrderByOptions;
}

const TABS: Tab[] = [
  { label: 'Rodada', value: OrderByOptions.RODADA },
  { label: 'Mês', value: OrderByOptions.MES },
  { label: 'Turno', value: OrderByOptions.TURNO },
  { label: 'Campeonato', value: OrderByOptions.CAMPEONATO },
];

interface LeagueTabsProps {
  activeTab: OrderByOptions;
  onTabChange: (tab: OrderByOptions) => void;
}

export function LeagueTabs({ activeTab, onTabChange }: LeagueTabsProps) {
  const colorTheme = useThemeColor();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorTheme === 'dark' ? '#161B22' : '#F0F0F0' },
      ]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            onPress={() => onTabChange(tab.value)}
            activeOpacity={0.8}
            style={[
              styles.tab,
              { backgroundColor: isActive ? Colors.light.tint : 'transparent' },
            ]}>
            <Text
              style={[
                styles.label,
                { color: isActive ? '#fff' : colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' },
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    margin: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});

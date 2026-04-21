import { Image, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MyClubDetails } from '@/models/Club';

interface HighlightCardProps {
  label: string;
  team: MyClubDetails;
}

export function HighlightCard({ label, team }: HighlightCardProps) {
  const colorTheme = useThemeColor();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.background : Colors.light.background,
          borderColor: colorTheme === 'dark' ? '#2D3748' : '#E2E8F0',
        },
      ]}>
      <Text style={[styles.label, { color: Colors.light.tint }]}>{label}</Text>
      <Image
        source={{ uri: team.url_escudo_png }}
        style={styles.shield}
        resizeMode="contain"
      />
      <Text style={styles.teamName} numberOfLines={1}>
        {team.nome}
      </Text>
      <Text
        style={[styles.cartola, { color: colorTheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}
        numberOfLines={1}>
        {team.nome_cartola}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  shield: {
    width: 40,
    height: 40,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  cartola: {
    fontSize: 11,
    textAlign: 'center',
  },
});

import { router } from 'expo-router';
import {  Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { PointsCompetitionListItem } from '@/models/Competition';

type Props = {
  competition: PointsCompetitionListItem;
  myTeamId?: number;
};

export function PointsCompetitionCard({ competition, myTeamId }: Props) {
  const colorTheme = useThemeColor();

  const privacyLabel = competition.privacidade === 'A' ? 'Aberta' : 'Fechada';
  const meta = `${privacyLabel} · ${competition.quantidade_participantes} / ${competition.quantidade_times} times`;

  const isOwner = !!myTeamId && competition.time_dono_id === myTeamId;

  return (
    <AnimatedCard
      variant="flat"
      className="p-0"
      onPress={() => router.push(`/leagues/points/${competition.slug}`)}>
      <View
        className="flex-row items-center"
        style={{ gap: 12, backgroundColor: 'transparent' }}>
        <Image
          source={{
            uri: competition.url_taca_png,
          }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colorTheme === 'dark' ? '#111827' : '#f3f4f6',
          }}
          alt={`Imagem da Competição ${competition.nome}`}
        />

        <View style={{ flex: 1, backgroundColor: 'transparent', gap: 4 }}>
          <Text className="text-base font-bold" numberOfLines={1}>
            {competition.nome}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {meta}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: 'transparent', flexWrap: 'wrap' }}>
            {isOwner && (
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colorTheme === 'dark' ? '#111827' : '#e5e7eb' }}>
                <Text className="text-[11px] font-semibold" style={{ color: '#a855f7' }}>
                  Dono
                </Text>
              </View>
            )}
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: colorTheme === 'dark' ? '#111827' : '#e5e7eb' }}>
              <Text className="text-[11px] font-semibold" style={{ color: '#00E094' }}>
                Pontos Corridos
              </Text>
            </View>
            {competition.membro && (
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colorTheme === 'dark' ? '#111827' : '#e5e7eb' }}>
                <Text className="text-[11px] font-semibold" style={{ color: '#00E094' }}>
                  Você participa
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}


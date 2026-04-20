import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {  TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import useInvites from '@/hooks/useInvites';
import usePointsCompetitionInvites from '@/hooks/usePointsCompetitionInvites';
import { useThemeColor } from '@/hooks/useThemeColor';

export function InvitesAlert() {
  const colorTheme = useThemeColor();

  const { invites } = useInvites();
  const { invites: pointsInvites } = usePointsCompetitionInvites();

  const invitesCount = useMemo(
    () => (invites?.convites?.length ?? 0) + (pointsInvites?.length ?? 0),
    [invites?.convites?.length, pointsInvites?.length]
  );

  if (invitesCount === 0) {
    return null;
  }

  return (
    <AnimatedCard delay={200} variant="flat">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push('/leagues/invites')}
        style={{ backgroundColor: 'transparent' }}>
        <View
          className="flex-row items-center justify-between"
          style={{ backgroundColor: 'transparent' }}>
          {/* Left side - Icon and text */}
          <View className="flex-row items-center flex-1" style={{ gap: 12, backgroundColor: 'transparent' }}>
            <View
              className="rounded-full items-center justify-center"
              style={{
                width: 40,
                height: 40,
                backgroundColor: colorTheme === 'dark' ? '#1e40af30' : '#DDEEFF',
              }}>
              <Feather name="mail" size={20} color="#0057FF" />
            </View>

            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
              <Text className="font-bold text-base" numberOfLines={1}>
                {invitesCount === 1 ? 'Novo convite' : 'Novos convites'}
              </Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {invitesCount} {invitesCount === 1 ? 'convite pendente' : 'convites pendentes'}
              </Text>
            </View>
          </View>

          {/* Right side - Badge and arrow */}
          <View className="flex-row items-center" style={{ gap: 8, backgroundColor: 'transparent', flexShrink: 0 }}>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: '#0057FF', minWidth: 32 }}>
              <Text className="text-sm font-bold text-center" style={{ color: '#ffffff' }}>
                {invitesCount}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colorTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

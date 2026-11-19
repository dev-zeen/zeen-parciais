import { Feather } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { ProfileCard } from '@/components/contexts/profile/ProfileCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTokens } from '@/hooks/useTokens';
import { MyClubDetails } from '@/models/Club';

/** Selos do cartoleiro: desde quando joga, PRO/Free e Facebook conectado. */
export function CartoleiroInfoCard({ team }: { team?: MyClubDetails }) {
  const { colors: tk } = useTokens();
  const colorTheme = useThemeColor();
  const chipBackground = colorTheme === 'dark' ? '#1F293730' : '#F3F4F6';
  const isPro = !!team?.assinante;

  return (
    <ProfileCard delay={600} icon="user" iconColor="#8b5cf6" title="Informações do Cartoleiro">
      <View className="flex-row flex-wrap" style={{ gap: 8, backgroundColor: 'transparent' }}>
        <View
          className="flex-row items-center px-3 py-2 rounded-full"
          style={{ backgroundColor: chipBackground, gap: 6 }}>
          <Feather name="calendar" size={14} color={tk.accent} />
          <Text className="text-sm font-semibold">Desde {team?.temporada_inicial ?? '—'}</Text>
        </View>

        <View
          className="flex-row items-center px-3 py-2 rounded-full"
          style={{ backgroundColor: isPro ? '#fbbf2420' : chipBackground, gap: 6 }}>
          <Feather name="star" size={14} color={isPro ? '#fbbf24' : '#6B7280'} />
          <Text
            className="text-sm font-semibold"
            style={{
              color: isPro ? '#fbbf24' : colorTheme === 'dark' ? '#6b7280' : '#9ca3af',
            }}>
            {isPro ? 'PRO' : 'Free'}
          </Text>
        </View>

        {team?.facebook_id ? (
          <View
            className="flex-row items-center px-3 py-2 rounded-full"
            style={{ backgroundColor: chipBackground, gap: 6 }}>
            <Feather name="facebook" size={14} color="#1877F2" />
            <Text className="text-sm font-semibold">Conectado</Text>
          </View>
        ) : null}
      </View>
    </ProfileCard>
  );
}

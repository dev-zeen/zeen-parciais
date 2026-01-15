
import { Text, View } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { numberToString } from '@/utils/parseTo';

type TeamStatsCardProps = {
  patrimonio: number;
  price: number;
  balance: number;
  reservesCount: number;
  totalReserves: number;
};

export function TeamStatsCard({
  patrimonio,
  price,
  balance,
  reservesCount,
  totalReserves,
}: TeamStatsCardProps) {
  const colorTheme = useThemeColor();

  return (
    <View
      className={`w-full flex-row items-center justify-around py-2 px-2 rounded-lg ${
        colorTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{ gap: 8 }}>
      <View className="items-center" style={{ backgroundColor: 'transparent' }}>
        <Text className="text-[10px] text-gray-500">Patrim.</Text>
        <Text className="font-bold text-sm">{numberToString(patrimonio)}</Text>
      </View>

      <View className="items-center" style={{ backgroundColor: 'transparent' }}>
        <Text className="text-[10px] text-gray-500">Preço</Text>
        <Text className="font-bold text-sm text-green-500">{numberToString(price)}</Text>
      </View>

      <View className="items-center" style={{ backgroundColor: 'transparent' }}>
        <Text className="text-[10px] text-gray-500">Rest.</Text>
        <Text className="font-bold text-sm text-purple-500">{numberToString(balance)}</Text>
      </View>

      <View className="items-center" style={{ backgroundColor: 'transparent' }}>
        <Text className="text-[10px] text-gray-500">Reservas</Text>
        <Text className="font-bold text-sm text-amber-500">
          {reservesCount}/{totalReserves}
        </Text>
      </View>
    </View>
  );
}

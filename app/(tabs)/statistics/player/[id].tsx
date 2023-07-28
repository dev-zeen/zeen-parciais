import { Text, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

const orderByOptions = {
  campeonato: 'campeonato',
  turno: 'turno',
  mes: 'mes',
  rodada: 'rodada',
  patrimonio: 'patrimonio',
  capitao: 'capitao',
};

export default () => {
  const { id: slug } = useLocalSearchParams();

  return (
    <View className="bg-white gap-y-1 mb-28">
      <Text> Página do jogador </Text>
    </View>
  );
};

import { Redirect } from 'expo-router';

export default function () {
  // UI de criação desabilitada — rotas existem, mas redirecionam.
  return <Redirect href="/(tabs)/leagues" />;
}


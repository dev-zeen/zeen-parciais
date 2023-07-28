import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="league/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="league/club/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="player/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

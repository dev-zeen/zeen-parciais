import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="league"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="club/[id]"
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
      <Stack.Screen
        name="cup-match/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="invites/index"
        options={{
          headerShown: false,
        }}
      />

      {/* Pontos Corridos */}
      <Stack.Screen
        name="points/[slug]"
        options={{
          headerShown: false,
        }}
      />

      {/* Create flows */}
      <Stack.Screen
        name="create/classic"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create/matamata"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create/points"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create/invite"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

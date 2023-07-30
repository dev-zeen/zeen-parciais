import { Stack } from "expo-router";

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
        name="[id]"
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
    </Stack>
  );
}

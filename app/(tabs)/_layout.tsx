import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

function TabBarIcon(props: { name: React.ComponentProps<typeof Feather>['name']; color: string }) {
  return <Feather size={28} style={{ marginBottom: -4 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useThemeColor();

  // Ensure colorScheme is valid
  const validColorScheme = (colorScheme === 'dark' || colorScheme === 'light') ? colorScheme : 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[validColorScheme].tint,
        tabBarInactiveTintColor: validColorScheme === 'dark' ? '#9ca3af' : '#6b7280',
        headerStyle: {
          backgroundColor:
            validColorScheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        },
        tabBarStyle: {
          backgroundColor:
            validColorScheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          borderTopWidth: 1,
          borderTopColor: validColorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
          ...(Platform.OS === 'android' ? { paddingBottom: 4 } : {}),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',

          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({ pressed }) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? "light"].text}
          //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          tabBarLabel: 'Time',
          headerTitle: 'Time',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="shield" color={color} />,
        }}
      />
      <Tabs.Screen
        name="leagues"
        options={{
          tabBarLabel: 'Ligas',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          tabBarLabel: 'Jogadores',
          headerTitle: 'Jogadores',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarLabel: 'Partidas',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="tv" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarLabel: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}

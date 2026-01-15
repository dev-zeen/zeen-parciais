import { Feather } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable, View, useColorScheme } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useInvites from '@/hooks/useInvites';

function TabBarIcon(props: { name: React.ComponentProps<typeof Feather>['name']; color: string }) {
  return <Feather size={28} style={{ marginBottom: -4 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { invites } = useInvites();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerStyle: {
          backgroundColor:
            colorScheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        },
        tabBarStyle: {
          // backgroundColor:
          //   colorScheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
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

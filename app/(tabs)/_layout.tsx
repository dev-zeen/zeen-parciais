import { Feather } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, useColorScheme } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useInvites from '@/hooks/useInvites';

function TabBarIcon(props: { name: React.ComponentProps<typeof Feather>['name']; color: string }) {
  return <Feather size={24} style={{ marginBottom: -3 }} {...props} />;
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
          backgroundColor:
            colorScheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
          paddingBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
          headerTitle: 'Ligas',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-2" color={color} />,
          headerRight: () => (
            <Link href="/leagues/invites/" asChild>
              <Pressable>
                {({ pressed }) => (
                  <View
                    className="flex-row items-center justify-center"
                    style={{
                      gap: 4,
                    }}>
                    {invites && invites.convites && invites?.convites?.length > 0 && (
                      <View className="w-6 h-6 bg-violet-600 items-center justify-center rounded-full">
                        <Text className="text-neutral-100">{invites?.convites?.length}</Text>
                      </View>
                    )}

                    <Feather
                      name="inbox"
                      size={24}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.6 : 1 }}
                    />
                  </View>
                )}
              </Pressable>
            </Link>
          ),
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

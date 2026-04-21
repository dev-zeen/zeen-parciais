import { ReactNode, useCallback, useMemo, useState } from 'react';
import {  FlatList, Text, TouchableOpacity,  View  } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ITab = {
  id: number;
  title: string;
  slug?: string;
  content?: () => ReactNode;
  onPress?: () => void;
};

type TabProps = {
  tabs: ITab[];
  initialTabActive?: number;
};

export function Tabs({ tabs, initialTabActive }: TabProps) {
  const colorTheme = useThemeColor();
  const [activeTab, setActiveTab] = useState(initialTabActive ?? 0);

  const renderTab = useCallback(
    ({ item, index }: { item: ITab; index: number }) => {
      const isActive = index === activeTab;
      const onPress = () => {
        if (activeTab === index) return;
        setActiveTab(index);
        item.onPress?.();
      };

      return (
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 2,
            borderBottomColor: isActive ? '#FF8A00' : 'transparent',
          }}
          onPress={onPress}>
          <Text
            style={{
              fontWeight: isActive ? '700' : '600',
              color: isActive ? '#FF8A00' : colorTheme === 'dark' ? '#e5e7eb' : '#111827',
            }}>
            {item.title}
          </Text>
        </TouchableOpacity>
      );
    },
    [activeTab, colorTheme]
  );

  const activeTabContent = useMemo(() => {
    const tab = tabs[activeTab];
    return tab?.content ? tab.content() : null;
  }, [tabs, activeTab]);

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 8,
          marginBottom: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colorTheme === 'dark' ? '#111827' : '#ffffff',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colorTheme === 'dark' ? '#1f2937' : '#f3f4f6',
          gap: 4,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}>
        <FlatList
          data={tabs}
          renderItem={renderTab}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
        />
      </View>
      {activeTabContent}
    </>
  );
}

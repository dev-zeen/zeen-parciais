import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

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
  const [activeTab, setActiveTab] = useState(initialTabActive ?? 0);

  const handlePress = useCallback((index: number): void => {
    setActiveTab(index);
  }, []);

  const memoizedTabs = useMemo(
    () =>
      tabs.map((tab, index) => ({
        ...tab,
        onPress: () => {
          if (activeTab !== index && tab.onPress) {
            tab.onPress();
            handlePress(index);
          }
        },
      })),
    [activeTab, handlePress, tabs]
  );

  const renderTab = useCallback(
    ({ item, index }: any) => {
      const isActive = index === activeTab;

      return (
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderBottomWidth: isActive ? 2 : 0,
            borderBottomColor: '#60a5fa',
          }}
          onPress={() => {
            setActiveTab(index);
            item.onPress();
          }}>
          <Text style={{ fontWeight: isActive ? 'bold' : 'normal' }}>{item.title}</Text>
        </TouchableOpacity>
      );
    },
    [activeTab]
  );

  const activeTabContent = useMemo(() => {
    const tab = memoizedTabs[activeTab];
    return tab.content && tab.content();
  }, [memoizedTabs, activeTab]);

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          borderRadius: 4,
          gap: 4,
        }}>
        <FlatList
          data={memoizedTabs}
          renderItem={renderTab}
          keyExtractor={(item) => item.title}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </View>
      {activeTabContent}
    </>
  );
}

import { ReactNode, useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/Colors';
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
  variant?: 'underline' | 'pill';
};

export function Tabs({ tabs, initialTabActive, variant = 'underline' }: TabProps) {
  const colorTheme = useThemeColor();
  const [activeTab, setActiveTab] = useState(initialTabActive ?? 0);

  const renderUnderlineTab = useCallback(
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

  if (variant === 'pill') {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 8,
            marginBottom: 8,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: colorTheme === 'dark' ? '#161B22' : '#F0F0F0',
          }}>
          {tabs.map((item, index) => {
            const isActive = index === activeTab;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  if (activeTab === index) return;
                  setActiveTab(index);
                  item.onPress?.();
                }}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  backgroundColor: isActive ? Colors.light.tint : 'transparent',
                  borderRadius: 10,
                  margin: 2,
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isActive ? '#fff' : colorTheme === 'dark' ? '#9CA3AF' : '#6B7280',
                  }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {activeTabContent}
      </>
    );
  }

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
          renderItem={renderUnderlineTab}
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

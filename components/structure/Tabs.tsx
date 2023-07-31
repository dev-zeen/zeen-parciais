import React, { ReactNode, useState } from "react";

import { Text, TouchableOpacity, View } from "@/components/Themed";

export type ITabs = {
  id: number;
  title: string;
  slug?: string;
  content?: () => ReactNode;
  onPress?: () => void;
};

type TabProps = {
  tabs: ITabs[];
  initialTabActive?: number;
};

export function Tabs({ tabs, initialTabActive }: TabProps) {
  const [activeTab, setActiveTab] = useState(initialTabActive ?? 0);

  const handlePress = (index: number): void => {
    setActiveTab(index);
  };

  const onRenderTabContent = (): ReactNode => {
    const tab = tabs[activeTab];
    return <View className="flex-1">{tab.content && tab.content()}</View>;
  };

  return (
    <>
      <View className="flex-row items-center justify-center px-4">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            activeOpacity={0.6}
            key={tab.id}
            className={`flex-1 p-2 items-center justify-evenly rounded-lg border-2 border-gray-200 mb-1 mx-0.5 ${
              activeTab === index && "border-2 border-blue-500 "
            }`}
            onPress={() => {
              tab?.onPress && tab?.onPress();
              handlePress(index);
            }}
          >
            <Text
              className={` ${
                activeTab === index
                  ? "font-medium text-xs"
                  : "font-normal text-xs"
              }`}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View>{onRenderTabContent()}</View>
    </>
  );
}

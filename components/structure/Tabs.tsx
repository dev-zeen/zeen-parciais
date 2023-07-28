import { Text, TouchableOpacity, View } from "@/components/Themed";
import React, { ReactNode, useState } from "react";

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
    return <View>{tab.content && tab.content()}</View>;
  };

  return (
    <>
      <View className="flex-row rounded-lg mt-1 px-1">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            activeOpacity={0.6}
            key={tab.id}
            className={`flex-1 h-10 items-center justify-evenly rounded-lg  mx-0.5 border-2 border-gray-200 ${
              activeTab === index && "border-2 border-blue-500 "
            }`}
            onPress={() => {
              handlePress(index);
              tab.onPress && tab.onPress();
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

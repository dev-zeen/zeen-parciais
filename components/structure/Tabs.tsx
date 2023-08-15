import { ReactNode, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
    return <View className="">{tab.content && tab.content()}</View>;
  };

  return (
    <>
      <View
        className="flex-row p-1 items-center justify-center bg-gray-200 rounded"
        style={{
          gap: 4,
        }}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            activeOpacity={0.6}
            key={tab.id}
            className={`flex-1 p-3 items-center justify-evenly rounded ${
              activeTab === index ? "bg-white" : "bg-gray-200 opacity-50"
            }`}
            onPress={() => {
              tab?.onPress && tab?.onPress();
              handlePress(index);
            }}
          >
            <Text className={` font-semibold text-xs`}>{tab.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View>{onRenderTabContent()}</View>
    </>
  );
}

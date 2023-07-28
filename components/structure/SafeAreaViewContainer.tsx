import { ReactNode } from "react";
import { SafeAreaView, useColorScheme } from "react-native";

type SafeAreaViewContainerProps = {
  children: ReactNode;
};

export function SafeAreaViewContainer({
  children,
}: SafeAreaViewContainerProps) {
  const colorTheme = useColorScheme();

  return (
    <SafeAreaView
      className={`flex-1 px-2 rounded-lg ${
        colorTheme === "dark" ? `bg-dark` : "bg-light"
      }`}
    >
      {children}
    </SafeAreaView>
  );
}

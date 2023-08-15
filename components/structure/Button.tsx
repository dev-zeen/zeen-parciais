import { TouchableOpacity, useColorScheme } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text } from "@/components/Themed";

interface ButtonProps {
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "warning"
    | "error"
    | "success"
    | "disabled";
  title?: string;
  iconName?: keyof typeof Feather.glyphMap;
  hasIcon?: boolean;
  colorIcon?: string;
  onlyIcon?: boolean;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  title,
  onPress,
  iconName,
  hasIcon,
  onlyIcon,
  disabled,
}: ButtonProps) {
  const colorTheme = useColorScheme();

  const variants = {
    primary: "bg-blue-500",
    secondary: "bg-violet-500",
    warning: "bg-orange-500",
    error: "bg-red-500",
    success: "bg-green-500",
    disabled: colorTheme === "dark" ? "bg-gray-400" : "bg-gray-300",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row px-2 py-3 items-center justify-center rounded-lg ${variants[variant]}`}
      activeOpacity={0.6}
      disabled={disabled}
    >
      {hasIcon && (
        <Feather
          name={iconName}
          color={"white"}
          size={16}
          style={{
            paddingHorizontal: 4,
          }}
        />
      )}
      {!onlyIcon && (
        <Text className="text-sm font-semibold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
}

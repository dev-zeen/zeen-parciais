import { TouchableOpacity } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text } from "@/components/Themed";

interface ButtonProps {
  onPress: () => void;
  variant?: "primary" | "secondary" | "warning" | "error" | "success";
  title?: string;
  iconName?: keyof typeof Feather.glyphMap;
  hasIcon?: boolean;
  colorIcon?: string;
  onlyIcon?: boolean;
}

export function Button({
  variant = "primary",
  title,
  onPress,
  iconName,
  hasIcon,
  onlyIcon,
}: ButtonProps) {
  const variants = {
    primary: "bg-blue-500",
    secondary: "bg-violet-500",
    warning: "bg-orange-500",
    error: "bg-red-500",
    success: "bg-green-500",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row px-2 py-3 items-center justify-center rounded-lg ${variants[variant]}`}
      activeOpacity={0.6}
    >
      {hasIcon && (
        <Feather
          name={iconName}
          color={"white"}
          size={14}
          style={{
            paddingHorizontal: 4,
          }}
        />
      )}
      {!onlyIcon && <Text className="font-medium text-sm">{title}</Text>}
    </TouchableOpacity>
  );
}

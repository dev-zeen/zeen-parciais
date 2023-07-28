import { Text } from "@/components/Themed";
import { TouchableOpacity } from "react-native";

interface ButtonProps {
  onPress: () => void;
  variant?: "primary" | "secondary" | "warning" | "error" | "success";
  title?: string;
}

export function Button({ variant = "primary", title, onPress }: ButtonProps) {
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
      className={`flex-row px-4 items-center justify-center rounded-lg py-3 ${variants[variant]}`}
      activeOpacity={0.6}
    >
      <Text className="text-white font-medium text-sm">{title}</Text>
    </TouchableOpacity>
  );
}

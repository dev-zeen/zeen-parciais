import React from "react";

import errorImage from "@/assets/images/error-background.png";
import { Text, View } from "@/components/Themed";
import { Button } from "@/components/structure/Button";
import { Image } from "react-native";

type CustomErrorBoundaryProps = {
  isError?: boolean;
  error?: Response | Error | null;
};

export function CustomFallbackErrorBoundary({
  error,
}: CustomErrorBoundaryProps) {
  return (
    <View
      className="bg-white flex-1 justify-center items-center"
      style={{
        gap: 16,
      }}
    >
      <Image
        source={errorImage}
        className="w-48 h-48 rounded-full"
        alt={`Imagem de erro na aplicação`}
      />
      <View className="items-center justify-center">
        <Text className="text-gray-700 text-sm">
          {error?.response?.data?.mensagem
            ? error.response.data.mensagem
            : error.message}
        </Text>
        <Text className="text-gray-500 text-sm font-light">
          Tente novamente em alguns instantes
        </Text>
      </View>

      <Button onPress={resetError} title="Voltar" />
    </View>
  );
}

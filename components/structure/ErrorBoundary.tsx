import { GestureResponderEvent, Image } from "react-native";

import errorImage from "@/assets/images/error-background.png";
import { Text, TouchableOpacity, View } from "@/components/Themed";
import { StatusErrorMessages } from "@/constants/Errors";
import { AxiosError } from "axios";

type CustomErrorBoundaryProps = {
  error: AxiosError<Error>;
  resetError: ((event: GestureResponderEvent) => void) | undefined;
};

export function ErrorBoundaryComponent({
  error,
  resetError,
}: CustomErrorBoundaryProps) {
  const errorData = error.response
    ? StatusErrorMessages[error.response.status as number]
    : StatusErrorMessages[1];

  return (
    <View
      className="bg-neutral-100 flex-1 justify-center items-center px-4"
      style={{
        gap: 16,
      }}
    >
      <Image
        source={errorImage}
        className="w-48 h-48 rounded-full"
        alt={`Imagem de erro na aplicação`}
      />
      <Text className="font-semibold text-base text-center">
        {errorData.message}
      </Text>

      <TouchableOpacity
        onPress={resetError}
        className="px-4 py-3 rounded bg-red-200 border-red-500 border"
      >
        <Text className="font-semibold">{errorData.buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

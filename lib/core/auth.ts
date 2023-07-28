import { ACCESS_TOKEN_KEY_STORAGE } from "@/constants/Keys";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getTokenFromStorage(): Promise<string | null> {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY_STORAGE);
  return token;
}

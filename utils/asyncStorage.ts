import AsyncStorage from "@react-native-async-storage/async-storage";

export const onSaveStorage = async <T>(key: string, data: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

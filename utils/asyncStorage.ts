import AsyncStorage from "@react-native-async-storage/async-storage";

export const onSaveStorage = async <T>(key: string, data: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

export const onGetFromStorage = async <T>(key: string): Promise<T> => {
  const data = await AsyncStorage.getItem(key);
  return JSON.parse(data as string);
};

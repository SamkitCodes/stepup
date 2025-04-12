import AsyncStorage from "@react-native-async-storage/async-storage";

export const getSettings = async () => {
  try {
    const stored = await AsyncStorage.getItem("appSettings");
    return stored
      ? JSON.parse(stored)
      : {
          vibration: true,
          sound: true,
          unit: "km",
        };
  } catch (err) {
    console.error("Failed to load settings:", err);
    return {
      vibration: true,
      sound: true,
      unit: "km",
    };
  }
};

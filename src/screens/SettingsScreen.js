// SettingsScreen.js - To change app settings

// Import React and required hooks
import React, { useEffect, useState } from "react";

// Import UI components from React Native
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  Alert,
} from "react-native";

// Import AsyncStorage to persist settings locally
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import TouchableOpacity separately
import { TouchableOpacity } from "react-native";

// Main component for settings screen
const SettingsScreen = () => {
  // State to hold app settings
  const [settings, setSettings] = useState({
    vibration: true,
    sound: true,
    unit: "km", // default distance unit
  });

  // Load settings from storage when component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  // Function to load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem("appSettings");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load settings");
    }
  };

  // Function to update a specific setting and store it
  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await AsyncStorage.setItem("appSettings", JSON.stringify(updated));
  };

  // Render the settings UI
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>⚙️ App Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Vibration</Text>
        <Switch
          value={settings.vibration}
          onValueChange={(val) => updateSetting("vibration", val)}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Sound</Text>
        <Switch
          value={settings.sound}
          onValueChange={(val) => updateSetting("sound", val)}
        />
      </View>

      <View style={styles.settingRowColumn}>
        <Text style={styles.label}>Distance Unit</Text>

        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              settings.unit === "km" && styles.unitSelected,
            ]}
            onPress={() => updateSetting("unit", "km")}
          >
            <Text
              style={[
                styles.unitText,
                settings.unit === "km" && styles.unitTextSelected,
              ]}
            >
              KM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.unitButton,
              settings.unit === "miles" && styles.unitSelected,
            ]}
            onPress={() => updateSetting("unit", "miles")}
          >
            <Text
              style={[
                styles.unitText,
                settings.unit === "miles" && styles.unitTextSelected,
              ]}
            >
              MILES
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styles for the settings UI
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f7f7f7",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    color: "#333",
  },
  note: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#777",
  },
  settingRowColumn: {
    marginVertical: 15,
  },
  unitToggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  unitSelected: {
    backgroundColor: "#007AFF",
  },
  unitText: {
    fontSize: 16,
    color: "#555",
  },
  unitTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

// Export SettingsScreen as default
export default SettingsScreen;

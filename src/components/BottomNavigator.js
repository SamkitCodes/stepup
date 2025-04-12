// Import React and required hooks
import React from "react";
import { BackHandler, Alert } from "react-native";

// Import Bottom Tab Navigator and icons
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Hook to detect screen focus
import { useFocusEffect } from "@react-navigation/native";

// Custom navigation ref for programmatic control
import { navigationRef } from "../components/navigationRef";

// Import screen components
import HomeScreen from "../screens/HomeScreen";
import JournalScreen from "../screens/JournalScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Component for bottom tab navigation
const BottomNavigator = () => {
  // Handle hardware back button behavior
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // If navigation isn't ready, do nothing
        if (!navigationRef.isReady()) return false;

        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        // If on Home screen, confirm app exit
        if (currentRouteName === "Home") {
          Alert.alert("Exit App", "Are you sure you want to exit?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => BackHandler.exitApp() },
          ]);
        } else {
          // Navigate to Home instead of exiting
          navigationRef.navigate("Home");
        }

        return true;
      };

      // Register back handler on focus
      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      // Cleanup on unfocus
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  // Configure tab navigator and render screens
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let icons = {
            Journal: focused ? "book" : "book-outline",
            Home: focused ? "home" : "home-outline",
            Settings: focused ? "settings" : "settings-outline",
            Profile: focused ? "person" : "person-outline",
          };

          return (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: {
          height: 60,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      })}
    >
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Export navigator as default
export default BottomNavigator;

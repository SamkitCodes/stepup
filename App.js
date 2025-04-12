// App.js - Entry point for the application, manages navigation

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "./src/screens/RegisterScreen";
import LoginScreen from "./src/screens/LoginScreen";
import BottomNavigator from "./src/components/BottomNavigator";
import MapScreen from "./src/screens/MapScreen";
import { navigationRef } from "./src/components/navigationRef";
import CameraScreen from "./src/screens/CameraScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Register">
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Home"
            component={BottomNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="MapScreen"
            component={MapScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="CameraScreen"
            component={CameraScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

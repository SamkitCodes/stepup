// LoginScreen.js - Handles user login functionality

import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebase_auth } from "../config/firebaseConfig";

const LoginScreen = () => {
  // Navigation hook
  const navigation = useNavigation();

  // State for form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State to track login errors
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Handle user login with Firebase Authentication
  const handleLogin = async () => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        firebase_auth,
        formData.email.trim(),
        formData.password
      );
      const user = userCredential.user;
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Navigate to the Register screen
  const handleGoToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
          secureTextEntry
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Login" onPress={handleLogin} color="#007BFF" />

      <TouchableOpacity
        onPress={handleGoToRegister}
        style={styles.registerButton}
      >
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },

  // Title text styles
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },

  // Input field container
  fieldContainer: {
    marginBottom: 16,
  },

  // Text input styles
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
  },

  // Error message styles
  error: {
    color: "red",
    marginVertical: 8,
    textAlign: "center",
  },

  // Register button container
  registerButton: {
    marginTop: 24,
    alignItems: "center",
  },

  // Register button text styles
  registerText: {
    color: "#007BFF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;

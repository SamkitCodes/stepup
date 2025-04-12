// RegisterScreen.js - Handles user registration functionality

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
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { validateRegistration } from "../services/validationHelper";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { firebase_auth } from "../config/firebaseConfig";
import { createUserData } from "../services/firestoreCRUD";

const RegisterScreen = () => {
  // Navigation hook
  const navigation = useNavigation();

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    password: "",
    goal: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Loading state for registration process
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Validate form data and register user
  const handleRegister = async () => {
    const validationErrors = validateRegistration(formData);

    const goalNumeric = Number(formData.goal);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      setLoading(true);

      try {
        // Create a new user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          firebase_auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        // Save user data in Firestore
        await createUserData({
          userId: user.uid,
          name: formData.name,
          email: formData.email,
          dob: formData.dob,
          goal: goalNumeric,
        });

        console.log("User registered and data saved successfully.");
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } catch (error) {
        console.error("Registration error:", error);
        setErrors({ firebase: error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  // Navigate to Login screen
  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(value) => handleChange("name", value)}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (DD/MM/YYYY)"
          value={formData.dob}
          onChangeText={(value) => handleChange("dob", value)}
        />
        {errors.dob && <Text style={styles.error}>{errors.dob}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
          secureTextEntry
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholder="Daily Distance Goal (in meters)"
          value={formData.goal}
          onChangeText={(value) => handleChange("goal", value)}
          keyboardType="numeric"
        />
        {errors.goal && <Text style={styles.error}>{errors.goal}</Text>}
      </View>

      {errors.firebase && <Text style={styles.error}>{errors.firebase}</Text>}

      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
        color="#007BFF"
        disabled={loading}
      />

      <TouchableOpacity onPress={handleGoToLogin} style={styles.loginButton}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    color: "#555",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    color: "#007BFF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;

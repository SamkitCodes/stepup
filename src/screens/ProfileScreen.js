// ProfileScreen.js - displays user profile and stats with edit and logout functionality

// Importing necessary libraries and components
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getUserData,
  getUserHistory,
  updateUserData,
} from "../services/firestoreCRUD";
import { firebase_auth } from "../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import MotivationalQuote from "../components/MotivationalQuote";

// Array representing days of the week for the heatmap display
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper function to convert Firestore timestamps into JS Date objects
const parseFirestoreTimestamp = (value) => {
  if (!value) return new Date("Invalid");
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (value.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
};

// Helper function to calculate age from date string in DD/MM/YYYY format
const calculateAge = (dobString) => {
  if (!dobString) return "--";
  const [day, month, year] = dobString.split("/").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Main ProfileScreen component
const ProfileScreen = () => {
  const navigation = useNavigation();

  // State variables for user data, weekly activity, loading status, etc.
  const [userData, setUserData] = useState(null);
  const [weekData, setWeekData] = useState(Array(7).fill(0));
  const [loading, setLoading] = useState(true);
  const [dailyDistance, setDailyDistance] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", goal: "", dob: "" });

  // Function to fetch user data and weekly run statistics
  const fetchData = async () => {
    try {
      const userId = firebase_auth.currentUser.uid;
      const data = await getUserData(userId);
      const history = await getUserHistory(userId);

      const now = new Date();
      const pastWeek = Array(7).fill(0);

      // Helper to check if two dates are the same day
      const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      let todayDistance = 0;

      // Populate weekData array with number of runs per day
      history.forEach((activity) => {
        const date = parseFirestoreTimestamp(activity.startedAt);
        const dayDiff = Math.floor((now - date) / 86400000);
        if (dayDiff >= 0 && dayDiff < 7) {
          const day = date.getDay();
          pastWeek[day]++;
        }
        if (isSameDay(now, date)) {
          todayDistance += activity.distance;
        }
      });

      setUserData(data);
      setWeekData(pastWeek);
      setDailyDistance(todayDistance);
    } catch (err) {
      // Error handling can be enhanced here
    } finally {
      setLoading(false);
    }
  };

  // Function to handle logout and navigate to Login screen
  const handleLogout = async () => {
    try {
      await firebase_auth.signOut();
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  // Function to allow user to choose a new profile image
  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const userId = firebase_auth.currentUser.uid;
      await updateUserData(userId, { profilePicture: uri });
      setUserData((prev) => ({ ...prev, profilePicture: uri }));
    }
  };

  // Function to save edited profile details
  const handleEditSave = async () => {
    const userId = firebase_auth.currentUser.uid;
    await updateUserData(userId, formData);
    setUserData((prev) => ({ ...prev, ...formData }));
    setEditModalVisible(false);
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Show loading indicator while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Calculate age and progress toward daily goal
  const age = calculateAge(userData?.dob);
  const goal = userData?.goal || 0;
  const progress = Math.min((dailyDistance / goal) * 100, 100);

  // Render user profile UI
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={
            userData?.profilePicture
              ? { uri: userData.profilePicture }
              : require("../../assets/default-profile.png")
          }
          style={styles.avatar}
        />
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{userData?.name || "User"}</Text>
      <Text style={styles.info}>Age: {age}</Text>

      <Text style={styles.info}>Daily Goal: {(goal / 1000).toFixed(2)} km</Text>
      <Text style={styles.info}>
        Today: {(dailyDistance / 1000).toFixed(2)} km /{" "}
        {(goal / 1000).toFixed(2)} km
      </Text>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <Button
        title="Edit Profile"
        onPress={() => {
          setFormData({
            name: userData?.name || "",
            goal: userData?.goal?.toString() || "",
            dob: userData?.dob || "",
          });
          setEditModalVisible(true);
        }}
      />

      <Text style={styles.subTitle}>Weekly Activity Heatmap</Text>

      <View style={styles.heatmapContainer}>
        {weekData.map((count, index) => (
          <View key={index} style={styles.heatmapItem}>
            <Text style={styles.dayLabel}>{daysOfWeek[index]}</Text>
            <View
              style={[
                styles.box,
                {
                  backgroundColor:
                    count === 0
                      ? "#e0e0e0"
                      : count < 2
                      ? "#90ee90"
                      : count < 4
                      ? "#32cd32"
                      : "#006400",
                },
              ]}
            />
            <Text style={styles.countText}>{count}</Text>
          </View>
        ))}
      </View>

      <MotivationalQuote />

      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
      </View>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((f) => ({ ...f, name: text }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Daily Goal (meters)"
              keyboardType="numeric"
              value={formData.goal}
              onChangeText={(text) =>
                setFormData((f) => ({ ...f, goal: text }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="DOB (DD/MM/YYYY)"
              value={formData.dob}
              onChangeText={(text) => setFormData((f) => ({ ...f, dob: text }))}
              style={styles.input}
            />
            <View style={styles.modalButtonRow}>
              <Button
                title="Cancel"
                onPress={() => setEditModalVisible(false)}
              />
              <Button title="Save" onPress={handleEditSave} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Stylesheet for the component UI
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  changePhoto: {
    fontSize: 12,
    color: "#007AFF",
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 20,
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
  },
  heatmapContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  heatmapItem: {
    alignItems: "center",
    marginHorizontal: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: "#555",
  },
  box: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginVertical: 4,
  },
  countText: {
    fontSize: 12,
    color: "#333",
  },
  logoutContainer: {
    marginTop: 30,
    width: "60%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    width: "90%",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    paddingVertical: 5,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

// Export the component as default
export default ProfileScreen;

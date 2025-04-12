// JournalScreen.js - Shows clickable history

// Import React and useState for managing state
import React, { useState } from "react";

// Import necessary React Native components
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

// Import Firebase auth for user ID access
import { getAuth } from "firebase/auth";

// Import helper to retrieve user's activity history
import { getUserHistory } from "../services/firestoreCRUD";

// Import hook to detect screen focus
import { useFocusEffect } from "@react-navigation/native";

// Import the ActivityCard component to display individual entries
import ActivityCard from "../components/ActivityCard";

// Main component for Journal screen
const JournalScreen = () => {
  // State to store fetched activity history
  const [history, setHistory] = useState([]);

  // State to track loading state
  const [loading, setLoading] = useState(true);

  // Get the current user's ID
  const userId = getAuth().currentUser?.uid;

  // Fetch history every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchHistory = async () => {
        try {
          if (!userId) return;

          // Get user's history and sort by most recent
          const result = await getUserHistory(userId);
          const sorted = result.sort(
            (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
          );
          setHistory(sorted);
        } catch (error) {
          // Log any errors that occur during fetch
          console.error("Failed to fetch history:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }, [userId])
  );

  // Render journal screen
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Activity Journal</Text>

      {loading ? (
        // Show loading spinner while fetching
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 20 }}
        />
      ) : (
        // Display history or a placeholder if empty
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {history.length === 0 ? (
            <Text style={styles.emptyMessage}>
              No activity history available yet.
            </Text>
          ) : (
            history.map((activity, index) => (
              <View key={index} style={{ width: "100%" }}>
                <ActivityCard activity={activity} allowExpand={true} />
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Define styles for the screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});

// Export the component as default
export default JournalScreen;

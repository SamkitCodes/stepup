// HomeScreen showing welcome, streak, stats, and recent activities

// Import necessary libraries and components
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getUserData,
  updateUserData,
  getUserHistory,
} from "../services/firestoreCRUD";
import { firebase_auth } from "../config/firebaseConfig";
import ActivityCard from "../components/ActivityCard";
import { getSettings } from "../services/settingsHelper";
import { Ionicons } from "@expo/vector-icons";

// Time range options for toggling stats
const timeRanges = ["Daily", "Weekly", "Monthly", "All"];

// Converts Firestore timestamp to JavaScript Date
const parseFirestoreTimestamp = (value) => {
  if (!value) return new Date("Invalid");
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (value.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
};

// Checks if two dates are on the same calendar day
const sameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

// Main HomeScreen component
const HomeScreen = () => {
  const navigation = useNavigation();

  // State variables for user data, history, loading, stats, animation, and unit preference
  const [userData, setUserData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsRange, setStatsRange] = useState("Weekly");
  const [totalDistance, setTotalDistance] = useState(0);
  const [maxPace, setMaxPace] = useState(null);
  const [showAnimation, setShowAnimation] = useState(null);
  const [unit, setUnit] = useState("km");

  // Load unit setting when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      getSettings().then((s) => setUnit(s.unit || "km"));
    }, [])
  );

  // Fetch user data and run history from Firestore
  const fetchData = async () => {
    try {
      const userId = firebase_auth.currentUser.uid;
      const data = await getUserData(userId);
      const userHistory = await getUserHistory(userId);

      // Convert timestamps in history to Date objects
      const parsedHistory = userHistory.map((item) => ({
        ...item,
        startedAt: parseFirestoreTimestamp(item.startedAt),
      }));

      // Sort history from most recent to oldest
      const sortedHistory = parsedHistory.sort(
        (a, b) => b.startedAt - a.startedAt
      );

      // Find today’s valid run to possibly increment streak
      const lastRun = sortedHistory.find((run) => {
        const runDate = new Date(run.startedAt);
        return sameDay(runDate, new Date()) && run.distance >= data.goal;
      });

      let updatedStreak = data.streak || 0;
      const now = new Date();

      // Find the most recent valid run by distance
      const mostRecentValidRun = sortedHistory.find(
        (run) => run.distance >= data.goal
      );

      if (mostRecentValidRun) {
        const lastRunDate = new Date(mostRecentValidRun.startedAt);
        const timeDiff = now - lastRunDate;

        if (!sameDay(now, lastRunDate)) {
          // Valid run not from today — no change
        } else if (sameDay(now, lastRunDate)) {
          const lastIncrement = new Date(data.lastStreakDate);
          if (!sameDay(now, lastIncrement)) {
            updatedStreak++;
            await updateUserData(userId, {
              streak: updatedStreak,
              lastStreakDate: now.toISOString(),
            });
            setShowAnimation("happy");
            setTimeout(() => setShowAnimation(null), 3000);
          }
        }
      } else {
        // Check if last run was too long ago and reset streak
        const lastRunDate = new Date(sortedHistory[0]?.startedAt);
        const timeDiff = now - lastRunDate;
        if (timeDiff >= 86400000 * 2) {
          updatedStreak = 0;
          await updateUserData(userId, { streak: 0 });
          setShowAnimation("sad");
          setTimeout(() => setShowAnimation(null), 3000);
        }
      }

      setUserData({ ...data, streak: updatedStreak });
      setHistory(sortedHistory);
    } catch (err) {
      // Error handling placeholder
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Recalculate statistics when range or history changes
  useEffect(() => {
    if (history.length >= 0) {
      const now = new Date();
      let filtered;

      // Filter history based on selected time range
      switch (statsRange) {
        case "Daily":
          filtered = history.filter((h) => sameDay(now, new Date(h.startedAt)));
          break;
        case "Weekly":
          filtered = history.filter(
            (h) => now - new Date(h.startedAt) <= 604800000
          );
          break;
        case "Monthly":
          filtered = history.filter(
            (h) => now - new Date(h.startedAt) <= 2629800000
          );
          break;
        default:
          filtered = history;
      }

      // Calculate total distance and fastest pace
      const totalDist = filtered.reduce((sum, h) => sum + h.distance, 0);
      const validPaces = filtered.filter(
        (h) => typeof h.fastestPace === "number"
      );

      const convertPace = (paceInMinPerKm) =>
        unit === "miles"
          ? (paceInMinPerKm / 0.621371).toFixed(2)
          : paceInMinPerKm.toFixed(2);

      const fastest = validPaces.sort(
        (a, b) => a.fastestPace - b.fastestPace
      )[0]?.fastestPace;

      setMaxPace(fastest ? convertPace(fastest) : null);

      const convertedDist =
        unit === "miles"
          ? (totalDist / 1609.34).toFixed(2)
          : (totalDist / 1000).toFixed(2);

      setTotalDistance(convertedDist);
    }
  }, [statsRange, history]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Render main Home screen content
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcome}>Welcome, {userData?.name || "User"}!</Text>

      <View style={styles.streakRow}>
        <Text style={styles.streak}>{userData?.streak || 0} 🔥 Streak</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Streak Info",
              `You earn 1🔥 per day when you complete a run longer than your goal (${userData?.goal} meters).`
            )
          }
        >
          <Ionicons name="information-circle-outline" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.rangeToggle}>
        {timeRanges.map((r) => (
          <TouchableOpacity key={r} onPress={() => setStatsRange(r)}>
            <Text
              style={[
                styles.toggleButton,
                statsRange === r && styles.selectedToggle,
              ]}
            >
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>
            {statsRange} Distance ({unit})
          </Text>
          <Text style={styles.statsValue}>{totalDistance}</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>{statsRange} Max Pace</Text>
          <Text style={styles.statsValue}>
            {maxPace || "--"} min/{unit === "miles" ? "mi" : "km"}
          </Text>
        </View>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent History</Text>
        {history.length === 0 ? (
          <Text style={styles.historyPlaceholder}>No recent activity yet.</Text>
        ) : (
          history.slice(0, 3).map((activity, idx) => (
            <View style={{ width: "100%" }} key={idx}>
              <ActivityCard activity={activity} allowExpand={false} />
            </View>
          ))
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Run"
          onPress={() => navigation.navigate("MapScreen")}
          color="#007BFF"
        />
      </View>

      {showAnimation === "happy" && (
        <Text style={styles.animatedMsg}>Streak Increased</Text>
      )}
      {showAnimation === "sad" && (
        <Text style={styles.animatedMsg}>Streak Reset</Text>
      )}
    </SafeAreaView>
  );
};

// Styles for HomeScreen UI elements
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  container: {
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  streak: {
    fontSize: 20,
    color: "#FF4500",
    textAlign: "center",
  },
  animatedMsg: {
    textAlign: "center",
    fontSize: 20,
    color: "green",
    marginBottom: 10,
  },
  rangeToggle: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  toggleButton: {
    fontSize: 14,
    color: "#555",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
  },
  selectedToggle: {
    backgroundColor: "#007BFF",
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  historyContainer: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  historyPlaceholder: {
    fontSize: 16,
    color: "#777",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
});

// Export the component as default
export default HomeScreen;

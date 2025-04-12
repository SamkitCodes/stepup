// MetricsPanel;.js - Show stats

import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Component to display run metrics during tracking
const MetricsPanel = ({ timer, distance, pace, isPaused, unit = "km" }) => {
  // Format timer from seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert distance based on selected unit
  const formatDistance = () => {
    return unit === "miles"
      ? (distance / 1609.34).toFixed(2) + " mi"
      : (distance / 1000).toFixed(2) + " km";
  };

  // Format pace according to units (min/km or min/mi)
  const formatPace = () => {
    if (pace === null || pace === undefined || isNaN(pace)) return "--";
    const converted = unit === "miles" ? pace / 0.621371 : pace;
    return converted.toFixed(2) + ` min/${unit === "miles" ? "mi" : "km"}`;
  };

  return (
    <View style={styles.panel}>
      {/* Time metric */}
      <View style={styles.metricBox}>
        <Text style={styles.label}>Time</Text>
        <Text style={styles.value}>{formatTime(timer)}</Text>
      </View>

      {/* Distance metric */}
      <View style={styles.metricBox}>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{formatDistance()}</Text>
      </View>

      {/* Pace metric */}
      <View style={styles.metricBox}>
        <Text style={styles.label}>Pace</Text>
        <Text style={styles.value}>{formatPace()}</Text>
      </View>
    </View>
  );
};

// Styles for the metrics panel layout
const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    width: "100%",
  },
  metricBox: {
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
});

export default MetricsPanel;

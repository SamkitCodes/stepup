// ActivityCard.js - Reusable card for activity summary (clickable only in JournalScreen)

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { getSettings } from "../services/settingsHelper";

const ActivityCard = ({ activity, allowExpand = true }) => {
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [unit, setUnit] = useState("km");

  const [selectedImage, setSelectedImage] = useState(null);

  const toggleExpand = () => {
    if (allowExpand) setExpanded(!expanded);
  };

  const formatPace = (pace) =>
    pace !== null && pace !== undefined ? pace.toFixed(2) : "--";

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let dateObj;
  try {
    dateObj = new Date(activity.startedAt);
  } catch (e) {
    dateObj = new Date("invalid");
  }

  useEffect(() => {
    getSettings().then((settings) => {
      setUnit(settings.unit || "km");
    });
  }, []);

  const displayDistance =
    unit === "miles"
      ? (activity.distance / 1609.34).toFixed(2) + " mi"
      : (activity.distance / 1000).toFixed(2) + " km";

  const formatConvertedPace = (pace) => {
    if (pace === null || pace === undefined) return "--";
    return unit === "miles" ? (pace / 0.621371).toFixed(2) : pace.toFixed(2);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={toggleExpand}
      activeOpacity={allowExpand ? 0.9 : 1}
    >
      <View style={styles.rowBetween}>
        <Text style={styles.time}>{formatTime(dateObj)}</Text>
        <Text style={styles.date}>{dateObj.toLocaleDateString()}</Text>
      </View>

      <Text style={styles.summary}>
        ⏱ {activity.duration}s | 📏 {displayDistance}
      </Text>
      <Text style={styles.summary}>
        🏃 Avg Pace: {formatConvertedPace(activity.averagePace)} min/
        {unit === "miles" ? "mi" : "km"}
      </Text>
      <Text style={styles.summary}>
        🔥 Fastest Pace: {formatConvertedPace(activity.fastestPace)} min/
        {unit === "miles" ? "mi" : "km"}
      </Text>

      {expanded && (
        <>
          {activity.routeScreenshot && (
            <Image
              source={{ uri: activity.routeScreenshot }}
              style={styles.routeImage}
            />
          )}
          {activity.notes && (
            <Text style={styles.notes}>📝 {activity.notes}</Text>
          )}
          {activity.photos && activity.photos.length > 0 && (
            <ScrollView
              horizontal
              style={styles.photoRow}
              showsHorizontalScrollIndicator={false}
            >
              {activity.photos.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedImage(uri);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  time: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  summary: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  notes: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
    color: "#444",
  },
  routeImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  photoRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
});

export default ActivityCard;

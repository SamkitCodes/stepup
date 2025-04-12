// SummaryModal.js Modal component to display post-run summary
import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Button,
} from "react-native";

const SummaryModal = ({
  visible,
  timer,
  distance,
  pace,
  fastestPace,
  pictures,
  runFeedback,
  setRunFeedback,
  routeScreenshot,
  onClose,
  unit = "km",
}) => {
  // Converts time from seconds to minutes and seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Converts distance to km or miles based on settings
  const formatDistance = () => {
    return unit === "miles"
      ? (distance / 1609.34).toFixed(2) + " mi"
      : (distance / 1000).toFixed(2) + " km";
  };

  // Converts pace to appropriate units
  const formatPace = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "--";
    const converted = unit === "miles" ? value / 0.621371 : value;
    return `${converted.toFixed(2)} min/${unit === "miles" ? "mi" : "km"}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Run Summary</Text>

            {/* Display run metrics */}
            <Text style={styles.metric}>⏱ Time: {formatTime(timer)}</Text>
            <Text style={styles.metric}>📏 Distance: {formatDistance()}</Text>
            <Text style={styles.metric}>🏃 Avg Pace: {formatPace(pace)}</Text>
            <Text style={styles.metric}>
              🔥 Fastest Pace: {formatPace(fastestPace)}
            </Text>

            {/* Display route screenshot if available */}
            {routeScreenshot && (
              <Image
                source={{ uri: routeScreenshot }}
                style={styles.routeImage}
              />
            )}

            {/* Display any photos taken during the run */}
            {pictures?.length > 0 && (
              <>
                <Text style={styles.subheading}>📸 Photos</Text>
                <ScrollView
                  horizontal
                  style={styles.photoRow}
                  showsHorizontalScrollIndicator={false}
                >
                  {pictures.map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={styles.photoThumbnail}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Text input for user feedback */}
            <Text style={styles.subheading}>📝 Notes</Text>
            <TextInput
              placeholder="Add feedback or notes..."
              value={runFeedback}
              onChangeText={setRunFeedback}
              style={styles.input}
              multiline
            />

            {/* Button to save the run and close modal */}
            <View style={styles.buttonWrapper}>
              <Button title="Save Run" onPress={onClose} color="#007AFF" />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Styles for the modal UI
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  content: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  metric: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
    color: "#333",
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
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  input: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    textAlignVertical: "top",
    minHeight: 80,
    marginTop: 6,
  },
  buttonWrapper: {
    marginTop: 20,
  },
});

export default SummaryModal;

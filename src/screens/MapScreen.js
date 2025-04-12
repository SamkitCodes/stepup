// ✅ MapScreen.js (with flash effect on screenshot capture)
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Button,
  StyleSheet,
  Alert,
  Vibration,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { captureRef } from "react-native-view-shot";
import { firebase_auth } from "../config/firebaseConfig";
import { addRunToHistory } from "../services/firestoreCRUD";

import { useRunTracker } from "../hooks/useRunTracker";
import MapDisplay from "../components/MapDisplay";
import MetricsPanel from "../components/MetricsPanel";
import ControlButtons from "../components/ControlButtons";
import SummaryModal from "../components/SummaryModal";
import { getSettings } from "../services/settingsHelper";
import { useFocusEffect } from "@react-navigation/native";

export default function MapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef();
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const {
    location,
    path,
    timer,
    distance,
    pace,
    isPaused,
    isRunning,
    pauseRun,
    resumeRun,
    endRun,
    fastestPace,
  } = useRunTracker();

  const [pictures, setPictures] = useState([]);
  const [runFeedback, setRunFeedback] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [routeScreenshot, setRouteScreenshot] = useState(null);
  const [unit, setUnit] = useState("km");

  useFocusEffect(
    React.useCallback(() => {
      getSettings().then((settings) => {
        setUnit(settings.unit || "km");
      });
    }, [])
  );

  useEffect(() => {
    const loadPictures = async () => {
      try {
        const stored = await AsyncStorage.getItem("RUN_PHOTOS");
        const parsed = stored ? JSON.parse(stored) : [];
        setPictures(parsed);
      } catch (err) {
        console.error("❌ Failed to load pictures", err);
      }
    };
    loadPictures();
  }, []);

  const triggerFlash = () => {
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFeedbackSubmit = async () => {
    try {
      const userId = firebase_auth.currentUser.uid;
      const stored = await AsyncStorage.getItem("RUN_PHOTOS");
      const parsedPictures = stored ? JSON.parse(stored) : [];

      const runData = {
        startedAt: new Date().toISOString(),
        duration: timer,
        distance,
        averagePace: distance > 0 ? timer / 60 / (distance / 1000) : null,
        fastestPace,
        photos: parsedPictures,
        routeScreenshot,
        notes: runFeedback,
      };

      await addRunToHistory(userId, runData);
      await AsyncStorage.removeItem("RUN_PHOTOS");

      setShowSummaryModal(false);
      navigation.navigate("Home");
    } catch (err) {
      console.error("🔥 Error saving run:", err);
      Alert.alert("Error", "Failed to save run to history.");
    }
  };

  const handleEndRun = async () => {
    endRun();

    const settings = await getSettings(); // ⬅️ load settings from storage

    if (settings.vibration) {
      Vibration.vibrate(100);
    }

    try {
      triggerFlash();
      const snapshot = await captureRef(mapRef, {
        format: "png",
        quality: 1,
      });
      setRouteScreenshot(snapshot);

      if (settings.sound) {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/shutter.mp3")
        );
        await sound.playAsync();
      }
    } catch (err) {
      console.error("🛑 Snapshot error:", err);
    }

    try {
      const stored = await AsyncStorage.getItem("RUN_PHOTOS");
      const parsed = stored ? JSON.parse(stored) : [];
      setPictures(parsed);
    } catch (err) {
      console.error("❌ Failed to fetch photos before summary", err);
    }

    setShowSummaryModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Back to Home"
          onPress={() => navigation.navigate("Home")}
        />
      </View>

      <MapDisplay ref={mapRef} location={location} path={path} />

      <View style={styles.bottomContainer}>
        <MetricsPanel
          timer={timer}
          distance={distance}
          pace={pace}
          isPaused={isPaused}
          unit={unit}
        />
        <ControlButtons
          isPaused={isPaused}
          onPause={pauseRun}
          onResume={resumeRun}
          onEnd={handleEndRun}
          onCamera={() => navigation.navigate("CameraScreen")}
        />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#fff",
            opacity: flashOpacity,
            zIndex: 99,
          },
        ]}
      />

      <SummaryModal
        visible={showSummaryModal}
        timer={timer}
        distance={distance}
        pace={pace}
        fastestPace={fastestPace}
        pictures={pictures}
        runFeedback={runFeedback}
        setRunFeedback={setRunFeedback}
        routeScreenshot={routeScreenshot}
        unit={unit}
        onClose={handleFeedbackSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    alignItems: "center",
  },
});

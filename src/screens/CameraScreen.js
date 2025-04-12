// CameraScreen.js - For camera functionality

// Import React and hooks
import React, { useRef, useState } from "react";

// Import components from React Native
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  Alert,
} from "react-native";

// Import CameraView and permission hook from Expo Camera
import { CameraView, useCameraPermissions } from "expo-camera";

// Import AsyncStorage for local persistence
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import navigation hook
import { useNavigation } from "@react-navigation/native";

// Export default CameraScreen component
export default function CameraScreen() {
  // Request and track camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // State to track captured photo URI
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // State to track which camera (front/back) is active
  const [facing, setFacing] = useState("back");

  // Reference to the CameraView instance
  const cameraRef = useRef(null);

  // Navigation object to return to previous screen
  const navigation = useNavigation();

  // Maximum number of photos to allow
  const MAX_PICTURES = 10;

  // Store photo URI in AsyncStorage, with a limit of 10 photos
  const savePhotoToStorage = async (uri) => {
    try {
      const existing = await AsyncStorage.getItem("RUN_PHOTOS");
      let photos = existing ? JSON.parse(existing) : [];
      if (photos.length < MAX_PICTURES) {
        photos.push(uri);
        await AsyncStorage.setItem("RUN_PHOTOS", JSON.stringify(photos));
      } else {
        Alert.alert("Max Photos Reached", "You can only store 10 photos.");
      }
    } catch (err) {
      // Optional: Handle error if needed
    }
  };

  // Function to take a photo using the camera reference
  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) {
      setCapturedPhoto(photo.uri);
    }
  };

  // Save photo and return to the previous screen
  const confirmSave = async () => {
    await savePhotoToStorage(capturedPhoto);
    setCapturedPhoto(null);
    navigation.goBack();
  };

  // Retake photo by clearing captured state
  const retake = () => setCapturedPhoto(null);

  // Toggle between front and back camera
  const toggleCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  // If camera permission is not granted, show prompt
  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text>Camera permission is required.</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render camera screen UI
  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        // Show preview if a photo is captured
        <View style={styles.previewContainer}>
          <RNImage source={{ uri: capturedPhoto }} style={styles.preview} />
          <View style={styles.confirmButtons}>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
              <Text style={styles.btnText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Live camera feed using CameraView */}
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            responsiveOrientationWhenOrientationLocked
          />

          {/* On-screen controls for flip, capture, and close */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={toggleCamera} style={styles.toggleBtn}>
              <Text style={styles.btnText}>Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={takePicture} style={styles.shutterBtn}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// Stylesheet for CameraScreen UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontSize: 16,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtn: {
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 45,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  preview: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  confirmBtn: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
  },
  retakeBtn: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
  },
});

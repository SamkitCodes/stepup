// src/components/ControlButtons.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ControlButtons = ({ isPaused, onPause, onResume, onEnd, onCamera }) => {
  return (
    <View style={styles.buttonsContainer}>
      {isPaused ? (
        <TouchableOpacity style={styles.button} onPress={onResume}>
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={onPause}>
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={onEnd}>
        <Text style={styles.buttonText}>End</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onCamera}>
        <Text style={styles.buttonText}>Camera</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ControlButtons;

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

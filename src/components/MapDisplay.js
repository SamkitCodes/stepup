// src/components/MapDisplay.js
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

// Forward the ref from parent
const MapDisplay = forwardRef(({ location, path }, ref) => {
  // Group path into segments with color
  const segments = [];

  for (let i = 1; i < path.length; i++) {
    const start = path[i - 1];
    const end = path[i];

    if (start && end) {
      const color = start.zone || "gray"; // fallback
      segments.push({
        coords: [start, end],
        color,
      });
    }
  }

  return (
    <MapView
      ref={ref}
      style={styles.map}
      region={
        location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }
          : undefined
      }
      showsUserLocation={true}
      followsUserLocation={true}
    >
      {/* Draw each segment with its zone color */}
      {segments.map((segment, index) => (
        <Polyline
          key={index}
          coordinates={segment.coords}
          strokeColor={segment.color}
          strokeWidth={4}
        />
      ))}
    </MapView>
  );
});

export default MapDisplay;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

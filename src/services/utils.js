// src/services/utils.js

export const calculateDistance = (coord1, coord2) => {
  const R = 6371000;
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
};

export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
};

export const formatDecimalPaceToTime = (paceDecimal) => {
  if (!paceDecimal || typeof paceDecimal !== "number" || isNaN(paceDecimal))
    return "--";

  const minutes = Math.floor(paceDecimal);
  const seconds = Math.round((paceDecimal - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")} min/km`;
};

export const getPaceZoneColor = (pace) => {
  if (pace < 4) return "#00C853";
  if (pace < 5.5) return "#2196F3";
  if (pace < 7) return "#FFC107";
  if (pace < 9) return "#FF5722";
  return "#B71C1C";
};

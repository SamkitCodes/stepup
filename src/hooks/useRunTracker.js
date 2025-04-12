import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { calculateDistance, getPaceZoneColor } from "../services/utils";

export function useRunTracker() {
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [timer, setTimer] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState("--");
  const [fastestPace, setFastestPace] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(true);

  const timerInterval = useRef(null);
  const locationSubscription = useRef(null);
  const previousLocation = useRef(null);
  const paceSnapshotRef = useRef(0);

  const MIN_DISTANCE_THRESHOLD = 3;

  useEffect(() => {
    if (!isPaused) {
      timerInterval.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }
    return () => clearInterval(timerInterval.current);
  }, [isPaused]);

  useEffect(() => {
    const startRun = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (loc) {
          setLocation(loc.coords);
          setPath([{ ...loc.coords, zone: "gray" }]);
          previousLocation.current = loc.coords;
          paceSnapshotRef.current = 0;
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (loc) => {
            if (!isPaused) {
              const newCoord = loc.coords;
              if (previousLocation.current) {
                const delta = calculateDistance(
                  previousLocation.current,
                  newCoord
                );
                if (delta > MIN_DISTANCE_THRESHOLD) {
                  setDistance((prev) => prev + delta);
                }
              }
              previousLocation.current = newCoord;
              setLocation(newCoord);

              // Add latest coord with zone (will update zone below)
              setPath((prev) => [...prev, { ...newCoord, zone: "gray" }]);
            }
          }
        );
      } catch (error) {
        Alert.alert("Error", "Could not get location: " + error.message);
      }
    };

    startRun();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [isPaused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const prevSnapshot = paceSnapshotRef.current;
        const delta = distance - prevSnapshot;

        if (delta >= MIN_DISTANCE_THRESHOLD) {
          const paceValue = 5 / 60 / (delta / 1000);
          const rounded = parseFloat(paceValue.toFixed(2));
          setPace(rounded);

          if (fastestPace === null || rounded < fastestPace) {
            setFastestPace(rounded);
          }

          setPath((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0) {
              const lastPoint = updated[lastIndex];
              updated[lastIndex] = {
                ...lastPoint,
                zone: getPaceZoneColor(rounded),
              };
            }
            return updated;
          });

          paceSnapshotRef.current = distance;
        } else {
          setPace("--");
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [distance, isPaused]);

  const pauseRun = () => setIsPaused(true);
  const resumeRun = () => setIsPaused(false);
  const endRun = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (locationSubscription.current) locationSubscription.current.remove();
  };

  return {
    location,
    path,
    timer,
    distance,
    pace,
    fastestPace,
    isPaused,
    isRunning,
    pauseRun,
    resumeRun,
    endRun,
  };
}

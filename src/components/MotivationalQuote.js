// Import necessary React and React Native components and APIs
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";

// Define the MotivationalQuote functional component
const MotivationalQuote = () => {
  // State to hold the fetched quote object
  const [quote, setQuote] = useState(null);

  // State to control the loading indicator
  const [loading, setLoading] = useState(true);

  // Animated value used for spinning the refresh icon
  const spinAnim = new Animated.Value(0);

  // Function to start the spin animation
  const spin = () => {
    spinAnim.setValue(0);

    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  // Async function to fetch a quote from the API
  const fetchQuote = async () => {
    try {
      setLoading(true);
      spin();

      const res = await fetch("https://zenquotes.io/api/random");

      const contentType = res.headers.get("content-type");

      // Throw an error if the response is not OK or is not JSON
      if (!res.ok || !contentType?.includes("application/json")) {
        throw new Error("Invalid response or non-JSON returned");
      }

      const rawData = await res.json();

      // Parse the fetched data and store the quote and author
      const data = JSON.parse(JSON.stringify(rawData[0]));
      setQuote({ q: data.q, a: data.a });
    } catch (err) {
      // Fallback quote in case of an error
      setQuote({ q: "Stay strong. Keep moving forward.", a: "Unknown" });
    } finally {
      // Stop loading state
      setLoading(false);
    }
  };

  // useEffect to fetch a quote on component mount
  useEffect(() => {
    fetchQuote();
  }, []);

  // Interpolate the animated value to a rotation value for the refresh icon
  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Render the component UI
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={fetchQuote} style={styles.refreshIconWrapper}>
        <Animated.Text
          style={[styles.refreshIcon, { transform: [{ rotate }] }]}
        >
          🔄
        </Animated.Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color="#555" />
      ) : (
        <>
          <Text style={styles.content}>"{quote?.q}"</Text>
          <Text style={styles.author}>- {quote?.a}</Text>
        </>
      )}
    </View>
  );
};

// Define the styles for the component using StyleSheet API
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 20,
    paddingTop: 40,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  refreshIconWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  refreshIcon: {
    fontSize: 20,
  },
  content: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
    lineHeight: 24,
  },
  author: {
    fontSize: 15,
    color: "#666",
    textAlign: "right",
    marginBottom: 12,
  },
});

// Export the component for use in other parts of the app
export default MotivationalQuote;

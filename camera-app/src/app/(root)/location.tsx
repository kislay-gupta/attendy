import { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Location from "expo-location";

export default function LocationScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");

          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          // maximumAge option is not supported in LocationOptions type
          // timeout is not supported in LocationOptions, removing it
        });
        setLocation(location);
      } catch (error: unknown) {
        setErrorMsg(
          "Error fetching location: " +
            (error instanceof Error ? error.message : String(error))
        );
      }
    }

    getCurrentLocation();
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\nAltitude: ${location.coords.altitude}\nAccuracy: ${location.coords.accuracy}m`;
  }
  console.log(location);
  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
  },
});

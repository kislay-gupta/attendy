import { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";

export default function LocationScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geocodedAddress, setGeocodedAddress] = useState<Location.LocationGeocodedAddress | null>(null);

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addresses.length > 0) {
        setGeocodedAddress(addresses[0]);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let locationSubscription: Location.LocationSubscription | null = null;

      async function getCurrentLocation() {
        try {
          setIsLoading(true);
          setErrorMsg(null);

          // Check if location services are enabled
          const enabled = await Location.hasServicesEnabledAsync();
          if (!enabled) {
            setErrorMsg(
              "Location services are disabled. Please enable them in your device settings."
            );
            return;
          }

          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setErrorMsg("Permission to access location was denied");
            return;
          }

          // Subscribe to location updates

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Highest,
              distanceInterval: 1, // Update every 1 meter
              timeInterval: 1000, // Update every 1 second
            },
            (newLocation) => {
              setLocation(newLocation);
              setIsLoading(false);
            }
          );
        } catch (error: unknown) {
          setErrorMsg(
            "Error fetching location: " +
              (error instanceof Error ? error.message : String(error))
          );
        } finally {
          setIsLoading(false);
        }
      }

      getCurrentLocation();

      // Cleanup function
      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    }, [])
  );
  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\nAltitude: ${location.coords.altitude}\nAccuracy: ${location.coords.accuracy}m`;
    if (geocodedAddress) {
      text += `\n\nAddress:\n${geocodedAddress.street || ''} ${geocodedAddress.streetNumber || ''}\n${geocodedAddress.city || ''}, ${geocodedAddress.region || ''} ${geocodedAddress.postalCode || ''}\n${geocodedAddress.country || ''}`;
    }
  }
  // Update the useEffect to get address when location changes
  useEffect(() => {
    if (location) {
      getAddressFromCoords(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);
  console.log(location);
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.paragraph}>{text}</Text>
      )}
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

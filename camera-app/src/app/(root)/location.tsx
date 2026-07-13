import { useState, useEffect, useCallback, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";

export default function LocationScreen() {
  const { token } = useAuth();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geocodedAddress, setGeocodedAddress] =
    useState<Location.LocationGeocodedAddress | null>(null);

  // Tracking & Offline States
  const [isTracking, setIsTracking] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<string | null>(null);
  const [pendingLogCount, setPendingLogCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const lastLoggedCoords = useRef<{ lat: number; lng: number } | null>(null);

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
      console.error("Error getting address:", error);
    }
  };

  // Check offline logs on mount
  const checkPendingLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem("offline_location_queue");
      if (stored) {
        const queue = JSON.parse(stored);
        setPendingLogCount(queue.length);
      } else {
        setPendingLogCount(0);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    checkPendingLogs();
  }, []);

  // Save coordinates to offline cache
  const cacheLocationOffline = async (
    lat: number,
    lng: number,
    battery?: number
  ) => {
    try {
      const stored = await AsyncStorage.getItem("offline_location_queue");
      const queue = stored ? JSON.parse(stored) : [];
      queue.push({
        latitude: lat,
        longitude: lng,
        batteryLevel: battery || 100,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(
        "offline_location_queue",
        JSON.stringify(queue)
      );
      setPendingLogCount(queue.length);
    } catch (e) {
      console.log("Failed to cache location offline:", e);
    }
  };

  // Post location log to server
  const sendLocationLog = async (lat: number, lng: number) => {
    if (!token) return;

    // Check if movement is significant (e.g. > 10 meters)
    if (lastLoggedCoords.current) {
      const distance = getDistanceInMeters(
        lat,
        lng,
        lastLoggedCoords.current.lat,
        lastLoggedCoords.current.lng
      );
      if (distance < 10) {
        // Skip log if agent has not moved significantly
        return;
      }
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/location-logs`,
        {
          latitude: lat,
          longitude: lng,
          batteryLevel: 100, // mock battery
          timestamp: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        setLastSentTime(new Date().toLocaleTimeString());
        lastLoggedCoords.current = { lat, lng };
      }
    } catch (error) {
      console.log("Location sync failed, caching offline:", error);
      await cacheLocationOffline(lat, lng, 100);
    }
  };

  // Sync Offline breadcrumbs
  const handleSyncLogs = async () => {
    if (!token || pendingLogCount === 0) return;
    setSyncing(true);
    try {
      const stored = await AsyncStorage.getItem("offline_location_queue");
      if (!stored) return;
      const queue = JSON.parse(stored);

      const response = await axios.post(
        `${BASE_URL}/api/v1/location-logs`,
        { logs: queue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        await AsyncStorage.removeItem("offline_location_queue");
        setPendingLogCount(0);
        Alert.alert(
          "Sync Successful",
          `Successfully uploaded ${queue.length} coordinates.`
        );
      }
    } catch (error) {
      console.log("Error syncing offline locations:", error);
      Alert.alert("Sync Failed", "Could not connect to tracking server.");
    } finally {
      setSyncing(false);
    }
  };

  // Distance helper (Haversine)
  const getDistanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useFocusEffect(
    useCallback(() => {
      let locationSubscription: Location.LocationSubscription | null = null;

      async function startLiveLocation() {
        try {
          setIsLoading(true);
          setErrorMsg(null);

          const enabled = await Location.hasServicesEnabledAsync();
          if (!enabled) {
            setErrorMsg("Location services are disabled in device settings.");
            setIsLoading(false);
            return;
          }

          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setErrorMsg("Permission to access location was denied.");
            setIsLoading(false);
            return;
          }

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 5, // Update every 5 meters
              timeInterval: 15000, // Update every 15 seconds
            },
            (newLocation) => {
              setLocation(newLocation);
              setIsLoading(false);

              // Auto-post location if tracking is toggled on
              if (isTracking) {
                sendLocationLog(
                  newLocation.coords.latitude,
                  newLocation.coords.longitude
                );
              }
            }
          );
        } catch (error: unknown) {
          setErrorMsg(
            "Error: " + (error instanceof Error ? error.message : String(error))
          );
          setIsLoading(false);
        }
      }

      startLiveLocation();

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    }, [isTracking])
  );

  useEffect(() => {
    if (location) {
      getAddressFromCoords(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="navigate-circle" size={48} color="#005055" />
        <Text style={styles.title}>Live Duty Tracking</Text>
        <Text style={styles.subtitle}>
          Track your path and field logs while on duty
        </Text>
      </View>

      {/* Geofence Status */}
      <View style={styles.trackingCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Duty Tracking Status:</Text>
          <Text
            style={[
              styles.statusVal,
              isTracking ? styles.trackingOn : styles.trackingOff,
            ]}
          >
            {isTracking ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            isTracking ? styles.btnStop : styles.btnStart,
          ]}
          onPress={() => setIsTracking(!isTracking)}
        >
          <Ionicons
            name={isTracking ? "stop-circle-outline" : "play-circle-outline"}
            size={22}
            color="white"
          />
          <Text style={styles.btnText}>
            {isTracking ? "Stop Live Tracking" : "Start Live Tracking"}
          </Text>
        </TouchableOpacity>

        {lastSentTime && (
          <Text style={styles.metaText}>
            Last logged coordinate sent at: {lastSentTime}
          </Text>
        )}
      </View>

      {/* Location Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Current Coordinates</Text>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color="#005055"
            style={{ padding: 12 }}
          />
        ) : location ? (
          <View style={styles.coordsGrid}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordVal}>
                {location.coords.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordVal}>
                {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>
            {errorMsg || "Getting coordinates..."}
          </Text>
        )}

        {geocodedAddress && (
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Decoded Address:</Text>
            <Text style={styles.addressText}>
              {geocodedAddress.street || ""}{" "}
              {geocodedAddress.streetNumber || ""}, {geocodedAddress.city || ""}
              , {geocodedAddress.region || ""}{" "}
              {geocodedAddress.postalCode || ""},{" "}
              {geocodedAddress.country || ""}
            </Text>
          </View>
        )}
      </View>

      {/* Offline Queue Control */}
      <View style={styles.queueCard}>
        <View style={styles.queueInfo}>
          <Ionicons name="cloud-offline-outline" size={24} color="#C62828" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.queueTitle}>Offline Breadcrumbs Queue</Text>
            <Text style={styles.queueDesc}>
              {pendingLogCount} cached coordinates waiting to sync.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.syncBtn,
            pendingLogCount === 0 ? styles.syncBtnDisabled : null,
          ]}
          disabled={pendingLogCount === 0 || syncing}
          onPress={handleSyncLogs}
        >
          {syncing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="sync-outline" size={16} color="white" />
              <Text style={styles.syncBtnText}>Upload Offline Coordinates</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#005055",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  trackingCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statusVal: {
    fontSize: 13,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  trackingOn: {
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  trackingOff: {
    color: "#666",
    backgroundColor: "#EEE",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  btnStart: {
    backgroundColor: "#005055",
  },
  btnStop: {
    backgroundColor: "#C62828",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  metaText: {
    fontSize: 11,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#005055",
    marginBottom: 10,
  },
  coordsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  coordBox: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  coordLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "bold",
  },
  coordVal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
  },
  addressBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#666",
  },
  addressText: {
    fontSize: 12,
    color: "#333",
    marginTop: 2,
    lineHeight: 16,
  },
  queueCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  queueInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  queueDesc: {
    fontSize: 12,
    color: "#666",
  },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C62828",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  syncBtnDisabled: {
    backgroundColor: "#E0E0E0",
  },
  syncBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});

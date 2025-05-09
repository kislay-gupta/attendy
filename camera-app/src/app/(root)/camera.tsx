import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Image,
  Button,
  Alert,
  BackHandler,
  TextInput, // Add this
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, Tabs } from "expo-router";
import { useCameraPermissions, CameraType, CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import type { LocationObject } from "expo-location";
import * as Location from "expo-location";
import axios from "axios";
import RNPickerSelect from "react-native-picker-select";
import { BASE_URL } from "@/constants";
import { LocationGeocodedAddress } from "expo-location";

const CameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [picture, setPicture] = useState<string | undefined>();
  const [photoType, setPhotoType] = useState("");
  const camera = useRef<CameraView>(null);
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<LocationGeocodedAddress | null>(null);
  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addresses.length > 0) {
        setAddress(addresses[0]);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };
  const checkPermissions = async () => {
    setIsLoadingLocation(true);
    try {
      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          "Location Required",
          "Location services are disabled. Please enable them in your device settings.",
          [
            {
              text: "Request Again",
              onPress: checkPermissions,
            },
            {
              text: "Exit App",
              onPress: () => BackHandler.exitApp(),
              style: "cancel",
            },
          ]
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "This app requires location access. Please enable location services to continue.",
          [
            {
              text: "Request Again",
              onPress: checkPermissions,
            },
            {
              text: "Exit App",
              onPress: () => BackHandler.exitApp(),
              style: "cancel",
            },
          ]
        );
        setLocationPermission(false);
        return;
      }

      setLocationPermission(true);

      // Get current position instead of watching
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation(currentLocation);
      await getAddressFromCoords(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setIsLoadingLocation(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your location. Would you like to try again?",
        [
          {
            text: "Retry",
            onPress: checkPermissions,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    checkPermissions();
  }, [permission]);
  // Remove this useEffect
  // useEffect(() => {
  //   (async () => {
  //     setIsLoadingLocation(true);
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status === "granted") {
  //       const location = await Location.getCurrentPositionAsync({
  //         accuracy: Location.Accuracy.Highest,
  //       });
  //       setLocation(location);
  //     }
  //     setIsLoadingLocation(false);
  //   })();
  // }, []);

  const UploadImage = async (picture: string) => {
    const formData = new FormData();
    // Create the correct file object for FormData
    formData.append("file", {
      uri: picture,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);
    formData.append("photoType", photoType);
    if (location) {
      formData.append("latitude", location.coords.latitude.toString());
      formData.append("longitude", location.coords.longitude.toString());
    }
    formData.append("timestamp", Date.now().toString());

    formData.append("address", address?.formattedAddress || "k");
    formData.append("description", description || "");
    try {
      // Use your device's IP address instead of localhost
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/api/v1/upload`, // Replace X with your actual IP
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };
  if (!permission?.granted) {
    return <ActivityIndicator />;
  }
  const takePicture = async () => {
    try {
      const res = await camera.current?.takePictureAsync();
      if (res) {
        setPicture(res.uri);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };
  const saveFile = async (uri: string | undefined) => {
    if (!uri) {
      console.error("Invalid file URI");
      return;
    }
    try {
      await UploadImage(uri);

      // Save location data along with the image

      setPicture(undefined);
      router.back();
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  console.log(address);
  if (isLoadingLocation || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005055" />
        <Text style={styles.loadingText}>Getting location...</Text>
        <Text style={styles.loadingText}>
          To get accurate location don't stand stagnant...
        </Text>
      </View>
    );
  }
  if (!locationPermission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005055" />
        <Text style={styles.loadingText}>Location permission is required</Text>
      </View>
    );
  }
  // Update the location overlay in the picture preview
  if (picture) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, position: "relative" }}>
          <Image source={{ uri: picture }} style={{ width: "100%", flex: 1 }} />
          {isLoadingLocation ? (
            <View style={styles.locationOverlay}>
              <ActivityIndicator color="white" size="small" />
            </View>
          ) : (
            location && (
              <View style={styles.locationOverlay}>
                <Text style={styles.locationText}>
                  Lat: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  Long: {location.coords.longitude.toFixed(6)}
                </Text>
                {address && (
                  <Text style={styles.locationText}>
                    {address?.formattedAddress}
                  </Text>
                )}
              </View>
            )
          )}
        </View>

        <View style={{ padding: 10 }}>
          <SafeAreaView
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 10,
              gap: 10,
            }}
            edges={["bottom"]}
          >
            <View style={{ width: "100%" }}>
              <RNPickerSelect
                onValueChange={(value) => setPhotoType(value)}
                placeholder={{ label: "Upload Type" }}
                items={[
                  { value: "Punch In", label: "Punch In" },
                  { value: "Duty", label: "Community" },
                  { value: "Punch Out", label: "Punch Out" },
                ]}
                style={{
                  viewContainer: {
                    marginTop: 4,

                    marginBottom: 2,
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: "gainsboro",
                  },
                  inputIOS: {
                    borderColor: "gainsboro",
                    borderWidth: 1,
                    width: "100%",
                    padding: 10,
                    borderRadius: 5,
                  },
                }}
              />
            </View>
            {photoType == "Duty" && (
              <View style={{ width: "100%" }}>
                <TextInput
                  style={{
                    height: 40,
                    margin: 12,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    borderColor: "gainsboro",
                  }}
                  placeholder="Description"
                  onChangeText={(text) => setDescription(text)}
                  value={description}
                />
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={[styles.saveButton, { flex: 1 }]}>
                {!loading && (
                  <Pressable
                    style={styles.buttonContainer}
                    onPress={() => setPicture(undefined)}
                  >
                    <Text style={[styles.buttonText, { color: "#FF4444" }]}>
                      Retake
                    </Text>
                  </Pressable>
                )}
              </View>
              <View style={[styles.saveButton, { flex: 1 }]}>
                {loading ? (
                  <View style={styles.loadingButton}>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.loadingButtonText}>Uploading...</Text>
                  </View>
                ) : (
                  <Pressable
                    style={[
                      styles.buttonContainer,
                      { backgroundColor: "#005055" },
                    ]}
                    onPress={() => saveFile(picture)}
                  >
                    <Text style={styles.buttonText}>Upload</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </SafeAreaView>
        </View>
        <MaterialIcons
          name="close"
          color={"white"}
          style={styles.close}
          size={30}
          onPress={() => {
            setPicture(undefined);
          }}
        />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <Tabs.Screen options={{ tabBarStyle: { display: "none" } }} />
      <CameraView
        mode={"picture"}
        ref={camera}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.footer}>
          <View />
          <View
            style={{ alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            <Pressable>
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "500",
                  gap: 1,
                }}
              >
                camera
              </Text>
            </Pressable>
            <Pressable
              style={[styles.recordButton, { backgroundColor: "white" }]}
              onPress={takePicture}
            />
          </View>
          <MaterialIcons
            name="flip-camera-android"
            color={"white"}
            size={30}
            onPress={toggleCameraFacing}
          />
        </View>
      </CameraView>
      <MaterialIcons
        name="close"
        color={"white"}
        style={styles.close}
        size={30}
        onPress={() => router.back()}
      />
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  camera: {
    width: "100%",
    height: "100%",
  },
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "white",
  },
  footer: {
    marginTop: "auto",
    padding: 20,
    paddingBottom: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#00000099",
  },
  close: {
    position: "absolute",
    top: 10,
    left: 20,
  },
  locationOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  locationText: {
    color: "white",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#005055",
    padding: 10,
    borderRadius: 5,
    gap: 10,
  },
  loadingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    minHeight: 40,
    justifyContent: "center",
  },
  buttonContainer: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

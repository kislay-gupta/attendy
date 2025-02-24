import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Image,
  Button,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useCameraPermissions, CameraType, CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import path from "path";
import * as FileSystem from "expo-file-system";
import type { LocationObject } from "expo-location";
import * as Location from "expo-location";
import location from "./location";

const CameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [facing, setFacing] = useState<CameraType>("back");
  const [picture, setPicture] = useState<string | undefined>();
  const camera = useRef<CameraView>(null);
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);
  useEffect(() => {
    (async () => {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        setLocation(location);
      }
      setIsLoadingLocation(false);
    })();
  }, []);
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
      const fileName = path.parse(uri).base;
      await FileSystem.copyAsync({
        from: uri,
        to: FileSystem.documentDirectory + fileName,
      });

      // Save location data along with the image
      if (location) {
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        };
        await FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + fileName + '.location.json',
          JSON.stringify(locationData)
        );
      }

      setPicture(undefined);
      router.back();
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  console.log(location);
  if (isLoadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Getting location...</Text>
      </View>
    );
  }
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
              </View>
            )
          )}
        </View>

        <View style={{ padding: 10 }}>
          <SafeAreaView edges={["bottom"]}>
            <Button title="Save" onPress={() => saveFile(picture)} />
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
});

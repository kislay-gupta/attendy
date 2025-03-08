import { View, Image, StyleSheet, Text } from "react-native";
import { Tabs, useFocusEffect, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../constants";
import { useCallback, useState } from "react";
import useLoader from "../../hooks/use-loader";
import Loader from "../../components/Loader";

interface PhotoData {
  _id: string;
  createdAt: string;
  img: string;
  latitude: number;
  address: string;
  longitude: number;
  photoType: "Punch In" | "Punch Out" | "Duty";
  timestamp: string;
  updatedAt: string;
  user: string;
}

export default function ImageScreen() {
  const { name } = useLocalSearchParams();
  const id = decodeURIComponent(name as string);
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const { startLoading, stopLoading, isLoading } = useLoader();
  const getSinglePhoto = async () => {
    startLoading();
    try {
      const res = await axios.get<{ data: PhotoData }>(
        `${BASE_URL}/api/v1/upload/${id}`
      );
      setPhoto(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading();
    }
  };
  const onFocus = useCallback(() => {
    getSinglePhoto();
  }, [id]);
  useFocusEffect(onFocus);
  if (isLoading) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      <Tabs.Screen
        options={{
          title: "Media",
        }}
      />
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo ? `${BASE_URL}/${photo.img}` : "" }}
          style={styles.image}
          resizeMode="contain"
        />
        {photo && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Type: {photo.photoType}</Text>
            <Text style={styles.overlayText}>
              Time: {new Date(photo.timestamp).toLocaleString()}
            </Text>
            <Text style={styles.overlayText}>
              Location: {photo.latitude.toFixed(6)},{" "}
              {photo.longitude.toFixed(6)}
            </Text>
            <Text style={styles.overlayText}>
              Address: {photo.address ? <>{photo.address}</> : <>N/A</>},{" "}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 15,
  },
  overlayText: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
  },
});

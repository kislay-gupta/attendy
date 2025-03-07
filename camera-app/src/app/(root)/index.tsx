import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  Button,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Link, router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { MediaType } from "../../utils/media";
import * as Network from "expo-network";
import axios from "axios";
import { BASE_URL } from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import useLoader from "../../hooks/use-loader";
import Loader from "../../components/Loader";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";

type Media = {
  _id: string;
  name: string;
  img: string;
  type: MediaType;
};
const HomeScreen = () => {
  const { token } = useAuth();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [image, setImage] = useState<Media[]>([]);
  const { startLoading, stopLoading, isLoading } = useLoader();
  async function fetchDeviceIp() {
    try {
      const ipAddress = await Network.getIpAddressAsync();
      console.log("Device  :", ipAddress);
    } catch (error) {
      console.error("Error fetching IP address:", error);
    }
  }
  const getUserImage = async () => {
    startLoading();
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setImage(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading();
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const formattedDate = date ? format(date.toString(), "yyyy-MM-dd") : "";
    hideDatePicker();
    router.push(`/date/${formattedDate}`);
    console.warn("A date has been picked: ", date);
  };

  useFocusEffect(
    useCallback(() => {
      // loadFiles();
      getUserImage();
      fetchDeviceIp();
    }, [])
  );

  if (isLoading) {
    return <Loader />;
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#FAF3E0" }}>
      <Button title="Show Date Picker" onPress={showDatePicker} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={() => handleConfirm(new Date())}
        onCancel={hideDatePicker}
      />

      <FlatList
        data={image}
        contentContainerStyle={{ gap: 1 }}
        columnWrapperStyle={{ gap: 1 }}
        numColumns={3}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/[name]",
              params: { name: `${item._id}` },
            }}
            asChild
          >
            <Pressable style={{ flex: 1, maxWidth: "33.33%" }}>
              <Image
                source={{ uri: `${BASE_URL}/${item.img}` }}
                style={{ aspectRatio: 3 / 4, borderRadius: 5 }}
              />

              {item.type === null && null}
            </Pressable>
          </Link>
        )}
      />
      <Link href="/camera" asChild>
        <Pressable style={styles.floatingButton}>
          <MaterialIcons name="photo-camera" size={30} color="white" />
        </Pressable>
      </Link>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: "royalblue",
    padding: 15,
    borderRadius: 50,
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

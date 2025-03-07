import { View, FlatList, Pressable, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Tabs, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../../../constants";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { MediaType } from "../../../utils/media";
type Media = {
  _id: string;

  img: string;
  type?: MediaType;
  photoType: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;

  __v: number;
};
const DateScreen = () => {
  const { token } = useAuth();
  const { date } = useLocalSearchParams();
  const [image, setImage] = useState<Media[]>([]);
  const getPhotosByDate = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/v1/upload/date-range-user/?startDate=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setImage(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getPhotosByDate();
  }, [date]);
  return (
    <View>
      <Tabs.Screen
        options={{
          title: typeof date === "string" ? date : "Date",
        }}
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
    </View>
  );
};

export default DateScreen;

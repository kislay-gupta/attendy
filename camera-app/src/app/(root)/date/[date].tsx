import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Tabs, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../../../constants";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";

const DateScreen = () => {
  const { token } = useAuth();
  const { date } = useLocalSearchParams();
  const getPhotosByDate = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/v1/org/date-range-user/?startDate=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
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
      <Text>{date}</Text>
    </View>
  );
};

export default DateScreen;

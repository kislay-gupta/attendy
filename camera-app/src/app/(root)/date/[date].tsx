import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const DateScreen = () => {
  const { date } = useLocalSearchParams();
  return (
    <View>
      <Text>{date}</Text>
    </View>
  );
};

export default DateScreen;

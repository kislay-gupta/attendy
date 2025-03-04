import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

interface LoaderProps {
  size?: number;
}

const Loader = ({ size = 200 }: LoaderProps) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/Animation.json")}
        autoPlay
        loop
        style={{
          backgroundColor: "#FAF3E0",
          width: size,
          height: size,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;

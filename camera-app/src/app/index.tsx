import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Link, Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
export default function SignupScreen() {
  const { isAuthenticated } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  if (isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#005055" />
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Redirecting...</Text>
        <Redirect href="/(root)/" />
      </View>
    );
  }

  return <Redirect href={"/login"} />;
}

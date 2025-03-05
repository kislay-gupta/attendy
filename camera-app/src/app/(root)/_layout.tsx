import { View, Platform, Pressable } from "react-native";
import { Redirect, Tabs, usePathname } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";

export default function RootLayout() {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  console.log(insets);
  const pathname = usePathname();

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, paddingBottom: 10, backgroundColor: "white" }}
        edges={["bottom"]}
      >
        <Tabs
          screenOptions={({ navigation }) => ({
            headerRightContainerStyle: {
              backgroundColor: "white",
              paddingRight: 16,
            },
            headerLeftContainerStyle: {
              backgroundColor: "white",
              paddingLeft: 16,
            },
            headerStyle: {
              backgroundColor: "white",
            },
            headerLeft: () => {
              const shouldShowBack = ["/camera", "/[name]"].some((path) =>
                pathname.includes(path)
              );

              return shouldShowBack ? (
                <Pressable onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </Pressable>
              ) : null;
            },
            tabBarStyle: {
              backgroundColor: "white",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarActiveTintColor: "#005055",
            tabBarInactiveTintColor: "#333333",
          })}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarLabel: "Home",
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="location"
            options={{
              title: "location",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="camera"
            options={{ headerShown: false, href: null }}
          />
          <Tabs.Screen
            name="[name]"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </SafeAreaView>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

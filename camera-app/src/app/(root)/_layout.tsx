import { Image, Pressable } from "react-native";
import { Tabs, usePathname } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import logo from "../../../assets/logo.png";
export default function RootLayout() {
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
              return (
                <Pressable
                  onPress={() => {
                    navigation.navigate("index");
                  }}
                  style={{
                    backgroundColor: "white",
                    padding: 1,
                    borderRadius: 50,
                  }}
                >
                  <Image
                    source={logo}
                    style={{ borderRadius: 50, width: 50, height: 50 }}
                  />
                </Pressable>
              );
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
              title: "MDH NGO Connect",
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
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

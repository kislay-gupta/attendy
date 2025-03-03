import { View, Text, Image } from "react-native";
import React from "react";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import { getMediaType } from "../utils/media";
import * as MediaLibrary from "expo-media-library";
const ImageScreen = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const fullUri = (FileSystem.documentDirectory || "") + (name || "");
  const type = getMediaType(fullUri);
  const onDelete = async () => {
    await FileSystem.deleteAsync(fullUri);
    router.back();
  };
  const onSave = async () => {
    try {
      if (permissionResponse?.status !== "granted") {
        await requestPermission();
      }
      const asset = await MediaLibrary.createAssetAsync(fullUri);
      if (asset) {
        alert("Media saved successfully");
      } else {
        alert("Failed to save media");
      }
    } catch (error) {
      console.log(error, "failed");
    }
  };
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Stack.Screen
        options={{
          title: "Media",

          headerRight: () => (
            <View style={{ gap: 10, flexDirection: "row" }}>
              <MaterialIcons
                onPress={onDelete}
                name="delete"
                size={26}
                color="crimson"
              />
              <MaterialIcons
                onPress={() => {
                  onSave();
                }}
                name="save"
                size={26}
                color="dimgray"
              />
            </View>
          ),
        }}
      />
      {type === "image" && (
        <Image
          source={{ uri: fullUri }}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </View>
  );
};

export default ImageScreen;

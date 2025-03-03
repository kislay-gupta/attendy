import React, { ComponentProps } from "react";
import { useController } from "react-hook-form";
import { Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
type CustomPicker = {
  name: string;
} & Omit<ComponentProps<typeof RNPickerSelect>, "onValueChange">;
export default function CustomPicker({ name, ...pickerProps }: CustomPicker) {
  const {
    field: { value, onBlur, onChange },
    fieldState: { error },
  } = useController({ name });
  return (
    <View>
      <RNPickerSelect
        {...pickerProps}
        value={value}
        onValueChange={onChange}
        onClose={onBlur}
        useNativeAndroidPickerStyle
        style={{
          viewContainer: {
            marginTop: 4,
            marginBottom: 2,
          },
          inputAndroid: {
            borderColor: error ? "red" : "gainsboro",
            borderWidth: 1,
            width: "100%",
            padding: 10,
            borderRadius: 5,
            color: "#000000",
            backgroundColor: "transparent",
            fontSize: 16,
          },
          inputIOS: {
            borderColor: error ? "red" : "gainsboro",
            borderWidth: 1,
            width: "100%",
            padding: 10,
            borderRadius: 5,
          },
        }}
      />
      <Text style={{ color: "crimson", height: 17 }} numberOfLines={1}>
        {error?.message}
      </Text>
    </View>
  );
}

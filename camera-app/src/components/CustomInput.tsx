import {
  View,
  StyleSheet,
  TextInput,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";
import React, { ComponentProps } from "react";
import { useController } from "react-hook-form";
type CustomTextInput = {
  label?: string;
  name: string;
  containerStyle?: StyleProp<ViewStyle>;
} & ComponentProps<typeof TextInput>;
export default function CustomTextInput({
  label,
  name,
  containerStyle,
  ...TextInputProps
}: CustomTextInput) {
  const {
    field: { value, onBlur, onChange },
    fieldState: { error },
  } = useController({ name });
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...TextInputProps}
        // value={fullName}
        // onChangeText={setFullName}
        value={value}
        onBlur={onBlur}
        onChangeText={onChange}
        style={[
          styles.input,
          TextInputProps.style,
          error ? styles.errorInput : {},
        ]}
      />
      <Text style={styles.error} numberOfLines={1}>
        {error?.message}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  input: {
    borderColor: "gainsboro",
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 3,
    marginBottom: 1,
  },
  label: {
    fontWeight: "600",
    color: "#333333",
  },
  errorInput: {
    borderColor: "crimson",
  },
  error: {
    color: "crimson",
    height: 17,
  },
});

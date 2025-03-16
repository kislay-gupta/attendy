import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Image,
} from "react-native";
import CustomTextInput from "@/components/CustomInput";
import { router } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import axios from "axios";
import { BASE_URL } from "@/constants";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useLoader from "@/hooks/use-loader";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { AxiosError } from "axios";
import CustomAlert from "@/components/CustomAlert";
import Loader from "@/components/Loader";
import logo from "../../assets/icon.png";
import { StatusBar } from "expo-status-bar";
const LoginScreen = () => {
  // Define form with type interface  const navigation = useNavigation();
  const { saveToken, isAuthenticated } = useAuth();
  const { startLoading, stopLoading, isLoading } = useLoader();
  const formSchema = z.object({
    mobileNo: z
      .string()
      .regex(/^[0-9]{10}$/, "Mobile number is required")
      .min(10, "Mobile number is required")
      .max(10, "Mobile number should be 10 digits"),
    password: z.string().min(8, "Password is required"),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      mobileNo: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(root)/");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async (data: z.infer<typeof formSchema>) => {
    startLoading();
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, data);
      if (!res.data.data.accessToken) {
        throw new Error("No token received from server");
      }
      await saveToken(res.data.data.accessToken);
      if (res.data.data.user.isVerified) {
        router.replace("/(root)/");
      } else {
        router.replace("/verify/verifydevice");
      }
    } catch (err) {
      console.log(err);
      if (err instanceof AxiosError) {
        setAlertConfig({
          visible: true,
          title: "Error",
          message: err.response?.data?.message || "An error occurred",
        });
      } else {
        setAlertConfig({
          visible: true,
          title: "Error",
          message: "Failed to login. Please try again.",
        });
      }
    } finally {
      stopLoading();
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.appTitle}>MDH NGO Connect</Text>
      </View>

      <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
        <FormProvider {...form}>
          <CustomTextInput
            name="mobileNo"
            label="Mobile Number"
            placeholder="Enter your mobile number"
            keyboardType="phone-pad"
          />

          <View style={{}}>
            <CustomTextInput
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={form.handleSubmit(handleLogin)}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </FormProvider>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#005055",
    marginTop: 10,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: "#005055",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
    backgroundColor: "transparent",
  },
  eyeIcon: {
    position: "absolute",
    color: "#333333",
    right: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontFamily: "cursive",
    fontSize: 32,
    marginBottom: 20,
  },
});

export default LoginScreen;

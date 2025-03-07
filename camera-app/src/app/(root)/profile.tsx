import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import useLoader from "../../hooks/use-loader";
import axios from "axios";
import { BASE_URL } from "../../constants/";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import { format } from "date-fns";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoader();
  const { token, loadToken, removeToken } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  useEffect(() => {
    const initializeToken = async () => {
      if (!token) {
        await loadToken();
      }
    };

    initializeToken();
  }, []);
  useEffect(() => {
    if (token) {
      getUser();
    }
  }, [token]);
  const handleConfirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      await removeToken();
      router.replace("/login");
    } catch (error) {
      console.log(error);
    }
  };
  const getUser = async () => {
    startLoading();
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.data);
    } catch (error: any) {
      console.log(error);
      // Handle 401 unauthorized error
      if (error?.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: () => {
                removeToken();
                router.push("/login");
                router.dismissAll();
              },
            },
          ]
        );
      }
    } finally {
      stopLoading();
    }
  };

  useFocusEffect(useCallback(() => {}, []));

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };
  if (isLoading) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: `${BASE_URL}/${user.avatar}` }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person-circle" size={80} color="#666" />
            )}
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.deviceInfo}>
            <Ionicons name="phone-portrait-outline" size={16} color="#666" />
            <Text style={styles.deviceText}>
              {user?.deviceInfo.deviceManufacture}{" "}
              {user?.deviceInfo.deviceModel}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.contactText}>{user?.mobileNo}</Text>
          </View>
        </View>
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalLogoutButton]}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.modalLogoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  modalLogoutButton: {
    backgroundColor: "#FF3B30",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  modalLogoutButtonText: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 10,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  deviceText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  optionsContainer: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});

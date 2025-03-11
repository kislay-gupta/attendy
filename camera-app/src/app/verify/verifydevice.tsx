import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import * as Device from "expo-device";
import axios from "axios";
import { BASE_URL } from "../../constants";
import CustomAlert from "../../components/CustomAlert";
import { useAuth } from "../../hooks/useAuth";
import { router } from "expo-router";
import useLoader from "../../hooks/use-loader";

export default function VerifyDevice() {
  const [showError, setShowError] = useState(false);
  const { token } = useAuth();
  const { startLoading, stopLoading, isLoading } = useLoader();
  const handleVerification = async () => {
    startLoading();
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/user/verify`,
        {
          deviceManufacture: Device.brand,
          deviceModel: Device.designName,
          isVerified: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.statusCode) {
        // Device verification successful
        // Proceed with the application flow
        <CustomAlert
          title=""
          message="Device verification successful"
          visible={true}
          onClose={() => {}}
        />;
        router.replace("/(root)/");
      } else {
        setShowError(true);
      }
    } catch (error) {
      setShowError(true);
    } finally {
      stopLoading();
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity
          onPress={handleVerification}
          style={styles.verifyButton}
        >
          <Text style={styles.buttonText}>
            {!isLoading ? (
              <>Verify Device</>
            ) : (
              <>
                <ActivityIndicator size="large" color="#ffffff" />
                verifying...
              </>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showError}
        onRequestClose={() => setShowError(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Verification failed. Please try again.
            </Text>
            <Pressable
              onPress={() => setShowError(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButton: {
    backgroundColor: "#005055",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 280,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#005055",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

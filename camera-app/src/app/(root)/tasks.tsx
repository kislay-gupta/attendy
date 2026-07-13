import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/Loader";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

interface Task {
  _id: string;
  title: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  dueDate?: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  checkInTime?: string;
  checkOutTime?: string;
  completionNotes?: string;
}

export default function TasksScreen() {
  const { token } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoader();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Completion form states
  const [completionNotes, setCompletionNotes] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const fetchTasks = async () => {
    if (!token) return;
    startLoading();
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.success) {
        setTasks(response.data.data);
      }
      await checkOfflineQueue();
    } catch (error) {
      console.log("Failed to fetch tasks:", error);
      // If offline, load from cache if possible
      const cached = await AsyncStorage.getItem("cached_tasks");
      if (cached) {
        setTasks(JSON.parse(cached));
      }
      Alert.alert("Notice", "You are viewing tasks offline.");
    } finally {
      stopLoading();
    }
  };

  const checkOfflineQueue = async () => {
    try {
      const queue = await AsyncStorage.getItem("offline_task_queue");
      if (queue) {
        const parsed = JSON.parse(queue);
        setOfflineQueueCount(parsed.length);
      } else {
        setOfflineQueueCount(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Request permissions helper
  const requestPermissions = async () => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const locationPerm = await Location.requestForegroundPermissionsAsync();

    if (cameraPerm.status !== "granted" || locationPerm.status !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and Location permissions are required to perform field task updates."
      );
      return false;
    }
    return true;
  };

  // Perform Task Check-in
  const handleCheckIn = async (task: Task) => {
    const granted = await requestPermissions();
    if (!granted) return;

    Alert.alert(
      "Task Check-In",
      "We will capture your check-in location and a picture of the site. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: async () => {
            try {
              // Get current location
              const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });

              // Launch camera
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.7,
              });

              if (
                result.canceled ||
                !result.assets ||
                result.assets.length === 0
              ) {
                return;
              }

              const photoUri = result.assets[0].uri;
              await executeCheckIn(
                task._id,
                photoUri,
                loc.coords.latitude,
                loc.coords.longitude
              );
            } catch (error) {
              console.log(error);
              Alert.alert("Error", "Check-in failed. Please try again.");
            }
          },
        },
      ]
    );
  };

  const executeCheckIn = async (
    taskId: string,
    imageUri: string,
    lat: number,
    lng: number
  ) => {
    startLoading();
    const formData = new FormData();
    formData.append("checkInPhoto", {
      uri: imageUri,
      type: "image/jpeg",
      name: `task_checkin_${taskId}.jpg`,
    } as any);
    formData.append("latitude", lat.toString());
    formData.append("longitude", lng.toString());
    formData.append("checkInTime", new Date().toISOString());

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/tasks/${taskId}/check-in`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success) {
        Alert.alert("Success", "Checked in to task successfully!");
        fetchTasks();
      }
    } catch (error: any) {
      console.log("Check-in error:", error);
      // Save offline if network failure
      if (!error.response || error.response.status >= 500) {
        await saveOfflineAction({
          taskId,
          type: "check-in",
          lat,
          lng,
          imageUri,
          timestamp: new Date().toISOString(),
        });
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Check-in failed"
        );
      }
    } finally {
      stopLoading();
    }
  };

  // Open Notes Modal for Completion
  const handleCompletePress = (taskId: string) => {
    setActiveTaskId(taskId);
    setCompletionNotes("");
    setIsNotesModalOpen(true);
  };

  const handleNotesSubmit = async () => {
    if (!completionNotes.trim()) {
      Alert.alert(
        "Validation Error",
        "Completion notes/agent report is required"
      );
      return;
    }
    setIsNotesModalOpen(false);

    const granted = await requestPermissions();
    if (!granted || !activeTaskId) return;

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const photoUri = result.assets[0].uri;
      await executeCompletion(
        activeTaskId,
        photoUri,
        loc.coords.latitude,
        loc.coords.longitude,
        completionNotes
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Task completion failed. Please try again.");
    }
  };

  const executeCompletion = async (
    taskId: string,
    imageUri: string,
    lat: number,
    lng: number,
    notes: string
  ) => {
    startLoading();
    const formData = new FormData();
    formData.append("checkOutPhoto", {
      uri: imageUri,
      type: "image/jpeg",
      name: `task_complete_${taskId}.jpg`,
    } as any);
    formData.append("latitude", lat.toString());
    formData.append("longitude", lng.toString());
    formData.append("checkOutTime", new Date().toISOString());
    formData.append("completionNotes", notes);

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/tasks/${taskId}/complete`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success) {
        Alert.alert("Success", "Task completed and submitted successfully!");
        fetchTasks();
      }
    } catch (error: any) {
      console.log("Completion error:", error);
      if (!error.response || error.response.status >= 500) {
        await saveOfflineAction({
          taskId,
          type: "complete",
          lat,
          lng,
          imageUri,
          notes,
          timestamp: new Date().toISOString(),
        });
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Task completion failed"
        );
      }
    } finally {
      stopLoading();
    }
  };

  // Offline queue storage helper
  const saveOfflineAction = async (action: any) => {
    try {
      const queue = await AsyncStorage.getItem("offline_task_queue");
      const currentQueue = queue ? JSON.parse(queue) : [];
      currentQueue.push(action);
      await AsyncStorage.setItem(
        "offline_task_queue",
        JSON.stringify(currentQueue)
      );
      setOfflineQueueCount(currentQueue.length);

      // Update local status of task to mock completion/check-in
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === action.taskId) {
            return {
              ...t,
              status: action.type === "check-in" ? "IN_PROGRESS" : "COMPLETED",
            };
          }
          return t;
        })
      );

      Alert.alert(
        "Network Offline",
        "Task action saved locally in offline queue. It will be uploaded automatically once connection is restored."
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Sync Offline Queue
  const syncOfflineQueue = async () => {
    const queueStr = await AsyncStorage.getItem("offline_task_queue");
    if (!queueStr) return;
    const queue = JSON.parse(queueStr);
    if (queue.length === 0) return;

    startLoading();
    let successCount = 0;
    const failedItems = [];

    for (const item of queue) {
      try {
        const formData = new FormData();
        formData.append("latitude", item.lat.toString());
        formData.append("longitude", item.lng.toString());

        if (item.type === "check-in") {
          formData.append("checkInPhoto", {
            uri: item.imageUri,
            type: "image/jpeg",
            name: `task_checkin_${item.taskId}.jpg`,
          } as any);
          formData.append("checkInTime", item.timestamp);
          await axios.patch(
            `${BASE_URL}/api/v1/tasks/${item.taskId}/check-in`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          formData.append("checkOutPhoto", {
            uri: item.imageUri,
            type: "image/jpeg",
            name: `task_complete_${item.taskId}.jpg`,
          } as any);
          formData.append("checkOutTime", item.timestamp);
          formData.append("completionNotes", item.notes);
          await axios.patch(
            `${BASE_URL}/api/v1/tasks/${item.taskId}/complete`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
        successCount++;
      } catch (error) {
        console.log("Failed to sync offline item:", item.taskId, error);
        failedItems.push(item);
      }
    }

    if (failedItems.length > 0) {
      await AsyncStorage.setItem(
        "offline_task_queue",
        JSON.stringify(failedItems)
      );
      Alert.alert(
        "Sync Partial",
        `Successfully uploaded ${successCount} tasks, but ${failedItems.length} actions failed to sync.`
      );
    } else {
      await AsyncStorage.removeItem("offline_task_queue");
      Alert.alert(
        "Sync Complete",
        `All ${successCount} offline task actions synchronized!`
      );
    }

    setOfflineQueueCount(failedItems.length);
    fetchTasks();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Text style={[styles.badge, styles.badgeCompleted]}>Completed</Text>
        );
      case "IN_PROGRESS":
        return (
          <Text style={[styles.badge, styles.badgeProgress]}>In Progress</Text>
        );
      default:
        return (
          <Text style={[styles.badge, styles.badgeAssigned]}>Assigned</Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Offline Sync Banner */}
      {offlineQueueCount > 0 && (
        <TouchableOpacity style={styles.syncBanner} onPress={syncOfflineQueue}>
          <Ionicons name="cloud-upload-outline" size={18} color="white" />
          <Text style={styles.syncBannerText}>
            You have {offlineQueueCount} unsynced offline task actions. Tap to
            Sync.
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Assigned Tasks</Text>

        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color="#888" />
            <Text style={styles.emptyText}>No tasks assigned to you</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <View key={task._id} style={styles.taskCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {getStatusBadge(task.status)}
              </View>

              {task.description ? (
                <Text style={styles.taskDesc}>{task.description}</Text>
              ) : null}

              <View style={styles.taskDetail}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{task.address}</Text>
              </View>

              {task.dueDate ? (
                <View style={styles.taskDetail}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.detailText}>
                    Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                  </Text>
                </View>
              ) : null}

              {/* Actions */}
              {task.status === "ASSIGNED" && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleCheckIn(task)}
                >
                  <Ionicons name="log-in-outline" size={16} color="white" />
                  <Text style={styles.actionBtnText}>Check-In at Site</Text>
                </TouchableOpacity>
              )}

              {task.status === "IN_PROGRESS" && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.completeBtn]}
                  onPress={() => handleCompletePress(task._id)}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color="white"
                  />
                  <Text style={styles.actionBtnText}>Complete Job</Text>
                </TouchableOpacity>
              )}

              {task.status === "COMPLETED" && (
                <View style={styles.completedTag}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.completedTagText}>
                    Job Completed Successfully
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Completion Notes Modal */}
      <Modal
        visible={isNotesModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsNotesModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Task Completion Report</Text>
            <Text style={styles.modalSubtitle}>
              Provide notes regarding your visit/inspection:
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. Visited the site, checked coordinates, everything looks fine."
              placeholderTextColor="#888"
              value={completionNotes}
              onChangeText={setCompletionNotes}
              multiline={true}
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setIsNotesModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleNotesSubmit}
              >
                <Text style={styles.submitBtnText}>Capture Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e53e3e",
    padding: 10,
    justifyContent: "center",
    gap: 8,
  },
  syncBannerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#005055",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: "#888",
    fontSize: 15,
  },
  taskCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  badgeAssigned: {
    color: "#EF6C00",
    backgroundColor: "#FFF3E0",
  },
  badgeProgress: {
    color: "#1565C0",
    backgroundColor: "#E3F2FD",
  },
  badgeCompleted: {
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  taskDesc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  taskDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#555",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#005055",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 14,
  },
  completeBtn: {
    backgroundColor: "#2E7D32",
  },
  actionBtnText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  completedTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 14,
  },
  completedTagText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  textArea: {
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: "top",
    backgroundColor: "#FFF",
    color: "#333",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#EEE",
  },
  submitBtn: {
    backgroundColor: "#2E7D32",
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "bold",
  },
  submitBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/Loader";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

interface LeaveRequest {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks?: string;
}

interface LeaveBalance {
  privilegeLeave: number;
  otherLeave: number;
}

export default function LeavesScreen() {
  const { token } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoader();

  // Balances & Requests State
  const [balance, setBalance] = useState<LeaveBalance>({
    privilegeLeave: 0,
    otherLeave: 0,
  });
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  // Apply Form State
  const [leaveType, setLeaveType] = useState<string>("Casual");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");

  // Date Picker States
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const fetchLmsData = async () => {
    if (!token) return;
    startLoading();
    try {
      const [balanceRes, listRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/leaves/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/v1/leaves`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (balanceRes.data?.success) {
        setBalance(balanceRes.data.data);
      }
      if (listRes.data?.success) {
        setRequests(listRes.data.data);
      }
    } catch (error) {
      console.log("Failed to load leaves:", error);
      Alert.alert("Error", "Failed to fetch leaves data");
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchLmsData();
  }, [token]);

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert("Validation Error", "All fields are required");
      return;
    }
    if (startDate > endDate) {
      Alert.alert("Validation Error", "Start date cannot be after end date");
      return;
    }

    startLoading();
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/leaves`,
        {
          leaveType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        Alert.alert("Success", "Leave request submitted successfully");
        // Reset form
        setStartDate(null);
        setEndDate(null);
        setReason("");
        fetchLmsData();
      }
    } catch (error: any) {
      console.log("Error submitting leave:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit leave request"
      );
    } finally {
      stopLoading();
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return styles.statusApproved;
      case "REJECTED":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const renderRequestItem = ({ item }: { item: LeaveRequest }) => {
    const days =
      Math.ceil(
        Math.abs(
          new Date(item.endDate).getTime() - new Date(item.startDate).getTime()
        ) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>{item.leaveType} Leave</Text>
          <Text style={[styles.cardStatus, getStatusStyle(item.status)]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.cardDates}>
          <Ionicons name="calendar-outline" size={14} color="#666" />{" "}
          {format(new Date(item.startDate), "MMM dd")} -{" "}
          {format(new Date(item.endDate), "MMM dd, yyyy")} ({days}{" "}
          {days === 1 ? "day" : "days"})
        </Text>
        <Text style={styles.cardReason} numberOfLines={2}>
          Reason: {item.reason}
        </Text>
        {item.remarks ? (
          <Text style={styles.cardRemarks}>Admin remarks: {item.remarks}</Text>
        ) : null}
      </View>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Leave Balances */}
      <View style={styles.balanceContainer}>
        <Text style={styles.sectionTitle}>Leave Balances</Text>
        <View style={styles.balanceGrid}>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceNum}>{balance.privilegeLeave}</Text>
            <Text style={styles.balanceLabel}>Privilege Leaves</Text>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceNum}>{balance.otherLeave}</Text>
            <Text style={styles.balanceLabel}>Other Leaves</Text>
          </View>
        </View>
      </View>

      {/* Apply Leave Request */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Apply for Leave</Text>

        {/* Leave Type Selector */}
        <Text style={styles.inputLabel}>Leave Type</Text>
        <View style={styles.typeSelector}>
          {["Casual", "Sick", "Privilege", "Outdoor Duty"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeBtn,
                leaveType === type ? styles.typeBtnActive : null,
              ]}
              onPress={() => setLeaveType(type)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  leaveType === type ? styles.typeBtnTextActive : null,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Pickers */}
        <View style={styles.dateGrid}>
          <View style={styles.dateCol}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setStartPickerVisible(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#005055" />
              <Text style={styles.dateBtnText}>
                {startDate ? format(startDate, "yyyy-MM-dd") : "Select Start"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.inputLabel}>End Date</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setEndPickerVisible(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#005055" />
              <Text style={styles.dateBtnText}>
                {endDate ? format(endDate, "yyyy-MM-dd") : "Select End"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reason Input */}
        <Text style={styles.inputLabel}>Reason</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Reason for applying leave..."
          placeholderTextColor="#888"
          value={reason}
          onChangeText={setReason}
          multiline={true}
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleApplyLeave}>
          <Text style={styles.submitBtnText}>Submit Leave Application</Text>
        </TouchableOpacity>
      </View>

      {/* Leave History List */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Leave History</Text>
        {requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No leave requests found</Text>
          </View>
        ) : (
          requests.map((item) => (
            <View key={item._id}>{renderRequestItem({ item })}</View>
          ))
        )}
      </View>

      {/* Date Picker Modals */}
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        onConfirm={(date) => {
          setStartDate(date);
          setStartPickerVisible(false);
        }}
        onCancel={() => setStartPickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        onConfirm={(date) => {
          setEndDate(date);
          setEndPickerVisible(false);
        }}
        onCancel={() => setEndPickerVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#005055",
    marginBottom: 12,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  balanceBox: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceNum: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#005055",
  },
  balanceLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 6,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  typeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#EEE",
  },
  typeBtnActive: {
    backgroundColor: "#005055",
  },
  typeBtnText: {
    fontSize: 12,
    color: "#555",
  },
  typeBtnTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  dateGrid: {
    flexDirection: "row",
    gap: 12,
  },
  dateCol: {
    flex: 1,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 8,
    backgroundColor: "#FFF",
  },
  dateBtnText: {
    fontSize: 12,
    color: "#333",
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
  },
  submitBtn: {
    backgroundColor: "#005055",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  historyContainer: {
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardType: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusApproved: {
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  statusRejected: {
    color: "#C62828",
    backgroundColor: "#FFEBEE",
  },
  statusPending: {
    color: "#EF6C00",
    backgroundColor: "#FFF3E0",
  },
  cardDates: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  cardReason: {
    fontSize: 13,
    color: "#666",
  },
  cardRemarks: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 6,
  },
});

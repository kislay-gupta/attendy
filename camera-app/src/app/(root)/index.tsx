import {
  View,
  Pressable,
  StyleSheet,
  Image,
  Button,
  Text,
  SectionList,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Link, router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { MediaType } from "@/utils/media";
import * as Network from "expo-network";
import axios from "axios";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import useLoader from "@/hooks/use-loader";
import Loader from "@/components/Loader";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format, parseISO } from "date-fns";

type Media = {
  _id: string;
  img: string;
  type?: MediaType;
  photoType: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  __v: number;
};

type Section = {
  title: string;
  data: Media[][];
};

const HomeScreen = () => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [images, setImages] = useState<Media[]>([]);
  const [groupedImages, setGroupedImages] = useState<Section[]>([]);
  const { startLoading, stopLoading, isLoading } = useLoader();
  const [user, setUser] = useState<User | null>(null);
  const { token, loadToken, removeToken } = useAuth();
  const [timeLapsed, setTimeLapsed] = useState(false);
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
  useFocusEffect(
    useCallback(() => {
      if (!user || !user.organization) return; // Early return if user data isn't available yet

      const currentTime = format(Date.now(), "HH:mm");
      const deadline = user.organization.morningAttendanceDeadline;

      if (deadline && currentTime > deadline) {
        setTimeLapsed(true);
        console.log(deadline);
      } else {
        setTimeLapsed(false);
      }
    }, [user]) // Add user as a dependency
  );
  async function fetchDeviceIp() {
    try {
      const ipAddress = await Network.getIpAddressAsync();
      console.log("Device IP:", ipAddress);
    } catch (error) {
      console.error("Error fetching IP address:", error);
    }
  }

  const getUserImage = async () => {
    startLoading();
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      setImages(data);
      groupImagesByDate(data);
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading();
    }
  };

  const groupImagesByDate = (images: Media[]) => {
    // Group images by date
    const groups: { [key: string]: Media[] } = {};

    images.forEach((image) => {
      // Format date as YYYY-MM-DD
      const date = format(parseISO(image.timestamp), "yyyy-MM-dd");

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(image);
    });

    // Convert groups to sections array for SectionList with rows for grid layout
    const sections = Object.keys(groups).map((date) => {
      const imagesForDate = groups[date];
      // Create rows with 3 items each for grid layout
      const rows: Media[][] = [];

      for (let i = 0; i < imagesForDate.length; i += 3) {
        rows.push(imagesForDate.slice(i, i + 3));
      }

      return {
        title: date,
        data: rows,
      };
    });

    // Sort sections by date (newest first)
    sections.sort((a, b) => b.title.localeCompare(a.title));

    setGroupedImages(sections);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
    hideDatePicker();
    router.push(`/date/${formattedDate}`);
    console.warn("A date has been picked: ", date);
  };

  useFocusEffect(
    useCallback(() => {
      getUserImage();
      fetchDeviceIp();
    }, [])
  );

  const renderImageItem = (item: Media) => (
    <Link
      key={item._id}
      href={{
        pathname: "/[name]",
        params: { name: `${item._id}` },
      }}
      asChild
    >
      <Pressable style={styles.imageContainer}>
        <Image
          source={{ uri: `${BASE_URL}/${item.img}` }}
          style={styles.image}
        />
        <View style={styles.timeTag}>
          <Text style={styles.timeText}>
            {format(parseISO(item.timestamp), "HH:mm")}
          </Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.photoType}</Text>
        </View>
      </Pressable>
    </Link>
  );

  const renderRow = ({ item }: { item: Media[] }) => (
    <View style={styles.row}>
      {item.map((image) => renderImageItem(image))}
      {/* Fill empty slots to maintain grid layout */}
      {item.length < 3 &&
        Array(3 - item.length)
          .fill(null)
          .map((_, index) => (
            <View key={`empty-${index}`} style={styles.emptyContainer} />
          ))}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {format(parseISO(section.title), "EEEE, MMMM d, yyyy")}
      </Text>
    </View>
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Attendance Photos</Text>
        <Button color="#005055" title="Select Date" onPress={showDatePicker} />
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      {groupedImages.length > 0 ? (
        <SectionList
          sections={groupedImages}
          keyExtractor={(item, index) => `row-${index}`}
          renderItem={renderRow}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={styles.listContent}
          renderSectionFooter={() => <View style={styles.sectionFooter} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No attendance photos found</Text>
        </View>
      )}
      {!timeLapsed && (
        <Link href="/camera" asChild>
          <Pressable style={styles.floatingButton}>
            <MaterialIcons name="photo-camera" size={30} color="white" />
          </Pressable>
        </Link>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F0EAD6",
    borderBottomWidth: 1,
    borderBottomColor: "#E0D8C0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  sectionHeader: {
    backgroundColor: "#F0EAD6",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 2,
  },
  sectionHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#555",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  imageContainer: {
    flex: 1,
    margin: 1,
    position: "relative",
  },
  emptyContainer: {
    flex: 1,
    margin: 1,
  },
  image: {
    aspectRatio: 3 / 4,
    borderRadius: 5,
    width: "100%",
  },
  timeTag: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  timeText: {
    color: "white",
    fontSize: 10,
  },
  typeTag: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  typeText: {
    color: "white",
    fontSize: 10,
  },
  floatingButton: {
    backgroundColor: "#005055",
    padding: 15,
    borderRadius: 50,
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listContent: {
    paddingBottom: 80,
  },
  sectionFooter: {
    height: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
  },
});

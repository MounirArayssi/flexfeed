import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { db } from "../../firebase"; // Adjust if your path is different

// Sample stories
const stories = [
  { id: "1", avatar: "https://randomuser.me/api/portraits/women/24.jpg", username: "Sarah", streak: true },
  { id: "2", avatar: "https://randomuser.me/api/portraits/men/18.jpg", username: "Ali", streak: false },
  { id: "3", avatar: "https://randomuser.me/api/portraits/men/19.jpg", username: "David", streak: true },
  { id: "4", avatar: "https://randomuser.me/api/portraits/women/22.jpg", username: "Jess", streak: true },
];

const categoryColors: Record<string, string> = {
  Study: "#6DC1E6",
  Fitness: "#65C18C",
  Food: "#ED5A6B",
  Default: "#C6C8D0",
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [feed, setFeed] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load feed (your flexes)
  useEffect(() => {
    setLoading(true);
    const flexesQuery = query(
      collection(db, "flexes"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(flexesQuery, (snapshot) => {
      const newFeed = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeed(newFeed);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLogWin = () => {
    router.push("/logwin");
  };

  return (
    <View style={[styles.container, colorScheme === "dark" && styles.containerDark]}>
      {/* --- Stories / Streaks --- */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesRow}
      >
        {stories.map((story) => (
          <View key={story.id} style={styles.storyBubble}>
            <View style={[styles.storyRing, story.streak && styles.storyRingActive]}>
              <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
              {story.streak && (
                <MaterialCommunityIcons name="fire" size={15} color="#F59C1D" style={styles.storyFire} />
              )}
            </View>
            <Text numberOfLines={1} style={styles.storyUsername}>{story.username}</Text>
          </View>
        ))}
      </ScrollView>

      {/* --- Weekly Stats Banner --- */}
      <View style={styles.statsBanner}>
        <Ionicons name="stats-chart" size={22} color="#76ABFF" style={{ marginRight: 5 }} />
        <Text style={styles.statsText}>3 flexes · 6 days streak · +13 reactions</Text>
        <TouchableOpacity>
          <Text style={styles.statsView}>View</Text>
        </TouchableOpacity>
      </View>

      {/* --- Feed --- */}
      {loading ? (
        <ActivityIndicator size="large" color="#ED5A6B" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={feed}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ED5A6B"
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 48 }}>
              <Ionicons name="happy-outline" size={54} color="#B0B7C3" />
              <Text style={{ color: "#B0B7C3", fontSize: 18, marginTop: 10 }}>
                No flexes yet. Be the first to flex! 💪
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, colorScheme === "dark" && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.avatar }} style={styles.cardAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>{item.user}</Text>
                  <Text style={styles.time}>
                    {item.timestamp?.seconds
                      ? new Date(item.timestamp.seconds * 1000).toLocaleString()
                      : ""}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: categoryColors[item.category] || categoryColors.Default }]}>
                  <Text style={styles.badgeText}>{item.category || "Other"}</Text>
                </View>
              </View>
              <Text style={styles.caption}>{item.caption}</Text>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.flexImage} />
              ) : null}
              <View style={styles.reactionBar}>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="heart-outline" size={21} color="#ED5A6B" style={{ marginRight: 3 }} />
                  <Text style={styles.reactionCount}>{item.reactions?.heart || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons name="fire" size={20} color="#F59C1D" style={{ marginRight: 3 }} />
                  <Text style={styles.reactionCount}>{item.reactions?.fire || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="hand-left-outline" size={19} color="#44C9B6" style={{ marginRight: 3 }} />
                  <Text style={styles.reactionCount}>{item.reactions?.clap || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="chatbubble-outline" size={19} color="#42527E" style={{ marginRight: 3 }} />
                  <Text style={styles.reactionCount}>0</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* --- Floating Action Button --- */}
      <TouchableOpacity style={styles.fab} onPress={handleLogWin}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB" },
  containerDark: { backgroundColor: "#20223A" },

  // Stories/avatars row
  storiesRow: {
    paddingVertical: 10,
    paddingLeft: 12,
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  storyBubble: {
    alignItems: "center",
    marginRight: 24,
    width: 60,
    position: "relative",
  },
  storyRing: {
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: "#d4d7ee",
    padding: 3,
    marginBottom: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  storyRingActive: {
    borderColor: "#F59C1D",
  },
  storyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  storyFire: { position: "absolute", top: -7, right: -8, zIndex: 3 },
  storyUsername: {
    fontSize: 13,
    color: "#42527E",
    marginTop: 2,
    textAlign: "center",
    maxWidth: 56,
    fontWeight: "600",
  },

  // Banner
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 2,
    shadowColor: "#191970",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 1,
  },
  statsText: { fontSize: 15, color: "#42527E", flex: 1 },
  statsView: { color: "#76ABFF", fontWeight: "600", marginLeft: 8 },

  // Feed cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: "#191970",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: { backgroundColor: "#282A3E" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  username: { fontWeight: "bold", color: "#334264", fontSize: 16 },
  time: { color: "#B0B7C3", fontSize: 13, marginTop: 2 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  badgeText: { color: "#fff", fontSize: 12 },
  caption: { fontSize: 16, color: "#344053", marginBottom: 8, marginLeft: 2 },
  flexImage: { width: "100%", height: 180, borderRadius: 12, marginTop: 6 },
  reactionBar: { flexDirection: "row", gap: 24, marginTop: 7 },
  reactionCount: { marginLeft: 2, color: "#B0B7C3", fontSize: 14 },

  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    backgroundColor: "#ED5A6B",
    borderRadius: 32,
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    elevation: 7,
    shadowColor: "#ED5A6B",
    shadowOpacity: 0.21,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 9,
  },
});

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
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
    useColorScheme,
    View,
} from "react-native";
import { auth, db } from "../firebase";

// Demo user (for avatar/profile only)
const userAvatar = "https://randomuser.me/api/portraits/men/11.jpg";

// Demo stories/streaks (you can connect these to Firestore later)
const stories = [
  { id: "1", avatar: "https://randomuser.me/api/portraits/women/24.jpg", username: "Sarah", streak: true },
  { id: "2", avatar: "https://randomuser.me/api/portraits/men/18.jpg", username: "Ali", streak: false },
  { id: "3", avatar: "https://randomuser.me/api/portraits/men/19.jpg", username: "David", streak: true },
  { id: "4", avatar: "https://randomuser.me/api/portraits/women/22.jpg", username: "Jess", streak: true },
];

// Category colors
const categoryColors: Record<string, string> = {
  Study: "#6DC1E6",
  Fitness: "#65C18C",
  Food: "#ED5A6B",
  Default: "#C6C8D0",
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [feed, setFeed] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // LIVE Firestore listener
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

  // Pull-to-refresh (just triggers re-render, Firestore is real-time)
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const handleLogWin = () => {
    router.push("/logwin");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <View style={[styles.container, colorScheme === "dark" && styles.containerDark]}>
      {/* Sticky App Bar */}
      <View style={[styles.appBar, colorScheme === "dark" && styles.appBarDark]}>
        <Text style={styles.logo}>FlexFeed</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={{ marginRight: 14 }}>
            <Ionicons name="notifications-outline" size={24} color="#42527E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleProfile}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 6 }}>
            <Ionicons name="log-out-outline" size={25} color="#ED5A6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories / Streaks Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streaksRow}>
        {stories.map(story => (
          <View key={story.id} style={styles.streakBubble}>
            <Image source={{ uri: story.avatar }} style={styles.streakAvatar} />
            {story.streak && (
              <MaterialCommunityIcons name="fire" size={18} color="#F59C1D" style={styles.streakFire} />
            )}
            <Text numberOfLines={1} style={styles.streakUsername}>{story.username}</Text>
          </View>
        ))}
      </ScrollView>

      {/* "Your Week" Banner (placeholder) */}
      <View style={styles.statsBanner}>
        <Ionicons name="stats-chart" size={22} color="#76ABFF" style={{ marginRight: 5 }} />
        <Text style={styles.statsText}>3 flexes · 6 days streak · +13 reactions</Text>
        <TouchableOpacity>
          <Text style={styles.statsView}>View</Text>
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      {loading ? (
        <ActivityIndicator size="large" color="#ED5A6B" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={feed}
          keyExtractor={item => item.id}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
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
              {item.image ? <Image source={{ uri: item.image }} style={styles.flexImage} /> : null}
              {/* Reaction Bar (for now: display counts only) */}
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

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleLogWin}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB" },
  containerDark: { backgroundColor: "#20223A" },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderColor: "#f2f2f2",
    zIndex: 10,
  },
  appBarDark: { backgroundColor: "#181A28", borderColor: "#2D3147" },
  logo: { fontWeight: "bold", fontSize: 29, color: "#42527E", letterSpacing: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  streaksRow: {
    paddingVertical: 8,
    paddingLeft: 14,
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  streakBubble: {
    alignItems: "center",
    marginRight: 20,
    width: 56,
    position: "relative",
  },
  streakAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 2,
    borderWidth: 2,
    borderColor: "#F59C1D",
  },
  streakFire: { position: "absolute", top: -8, right: -7, zIndex: 3 },
  streakUsername: { fontSize: 12, color: "#42527E", marginTop: 2, textAlign: "center", maxWidth: 54 },
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

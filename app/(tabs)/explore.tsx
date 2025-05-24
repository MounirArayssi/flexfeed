import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native";
import { db } from "../../firebase";

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [flexes, setFlexes] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users and flexes
    const fetchAll = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const flexesSnap = await getDocs(collection(db, "flexes"));
        setFlexes(flexesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setUsers([]);
        setFlexes([]);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Filtered results based on query
  const lower = query.toLowerCase();

  // Filter users
  const userResults = !query
    ? []
    : users.filter(
        user =>
          user.displayName?.toLowerCase().includes(lower) ||
          user.email?.toLowerCase().includes(lower)
      );

  // Filter flexes by caption or user
  const flexResults = !query
    ? []
    : flexes.filter(
        flex =>
          flex.caption?.toLowerCase().includes(lower) ||
          flex.category?.toLowerCase().includes(lower) ||
          flex.user?.toLowerCase().includes(lower)
      );

  // Categories found (optional: unique, just for show)
  const categories = Array.from(
    new Set(
      flexResults
        .map(flex => flex.category)
        .filter(cat => cat?.toLowerCase().includes(lower))
    )
  );

  return (
    <View style={[styles.container, colorScheme === "dark" && styles.containerDark]}>
      <Text style={styles.heading}>Explore</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#B0B7C3" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#B0B7C3"
        />
      </View>
      {loading ? (
        <ActivityIndicator color="#ED5A6B" style={{ marginTop: 40 }} />
      ) : !query ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <MaterialCommunityIcons name="compass-outline" size={50} color="#B0B7C3" />
          <Text style={{ color: "#B0B7C3", fontSize: 18, marginTop: 12 }}>Try searching for users, flexes, or categories!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* --- Users --- */}
          {userResults.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>Users</Text>
              {userResults.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userRow}
                  onPress={() => router.push(`/profile/${user.id}`)}
                >
                  <Image
                    source={{
                      uri: user.photoURL || "https://randomuser.me/api/portraits/men/11.jpg",
                    }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.name}>{user.displayName || "User"}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* --- Flexes --- */}
          {flexResults.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>Flexes</Text>
              {flexResults.map(flex => (
                <TouchableOpacity
                  key={flex.id}
                  style={styles.flexRow}
                  onPress={() => {/* can link to flex details page if you have one */}}
                >
                  <View style={[styles.badge, { backgroundColor: categoryColors[flex.category] || "#C6C8D0" }]}>
                    <Text style={styles.badgeText}>{flex.category || "Other"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.flexCaption} numberOfLines={2}>{flex.caption}</Text>
                    <Text style={styles.flexMeta}>
                      by {flex.user || "Someone"}
                    </Text>
                  </View>
                  {flex.image && (
                    <Image source={{ uri: flex.image }} style={styles.flexImg} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* --- Categories --- */}
          {categories.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>Categories</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {categories.map(cat => (
                  <View key={cat} style={[styles.catBadge, { backgroundColor: categoryColors[cat] || "#C6C8D0" }]}>
                    <Text style={styles.catBadgeText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* No results */}
          {userResults.length === 0 && flexResults.length === 0 && categories.length === 0 && (
            <View style={{ alignItems: "center", marginTop: 32 }}>
              <Ionicons name="search" size={40} color="#B0B7C3" />
              <Text style={{ color: "#B0B7C3", fontSize: 16, marginTop: 10 }}>No results found.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const categoryColors: Record<string, string> = {
  Study: "#6DC1E6",
  Fitness: "#65C18C",
  Food: "#ED5A6B",
  Default: "#C6C8D0",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB", paddingHorizontal: 16, paddingTop: 18 },
  containerDark: { backgroundColor: "#20223A" },
  heading: { fontWeight: "bold", fontSize: 21, color: "#42527E", marginBottom: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#EAF3FF",
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 45,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#42527E",
    paddingVertical: 7,
  },
  sectionHeader: { color: "#7C869A", fontWeight: "bold", fontSize: 14, marginTop: 18, marginBottom: 7 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: "#f1f1f1",
    gap: 13,
  },
  avatar: { width: 45, height: 45, borderRadius: 23, marginRight: 13 },
  name: { fontWeight: "600", fontSize: 16, color: "#344053" },
  email: { color: "#7C869A", fontSize: 13 },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: "#f1f1f1",
    gap: 13,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
    backgroundColor: "#C6C8D0",
    alignItems: "center",
    minWidth: 56,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  flexCaption: { color: "#334264", fontSize: 15, fontWeight: "500" },
  flexMeta: { color: "#7C869A", fontSize: 12 },
  flexImg: { width: 44, height: 44, borderRadius: 7, marginLeft: 10 },
  catBadge: {
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginRight: 7,
    marginBottom: 8,
    backgroundColor: "#D3D3D3",
    alignItems: "center",
    minWidth: 56,
  },
  catBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
});

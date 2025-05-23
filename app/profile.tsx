import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut, updateProfile } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebase";

const categoryColors: Record<string, string> = {
  Study: "#6DC1E6",
  Fitness: "#65C18C",
  Food: "#ED5A6B",
  Social: "#C698F3",
  Other: "#D3D3D3",
  Default: "#C6C8D0",
};

function formatJoinedDate(user: any) {
  if (!user?.metadata?.creationTime) return "";
  const date = new Date(user.metadata.creationTime);
  return date.toLocaleDateString();
}

function countReactions(flexes: any[]) {
  return flexes.reduce(
    (acc, flex) => {
      if (flex.reactions) {
        acc.heart += flex.reactions.heart || 0;
        acc.fire += flex.reactions.fire || 0;
        acc.clap += flex.reactions.clap || 0;
      }
      return acc;
    },
    { heart: 0, fire: 0, clap: 0 }
  );
}

function getStreak(flexes: any[]) {
  if (flexes.length === 0) return { current: 0, best: 0 };
  // Sort by timestamp DESC
  const sorted = flexes
    .filter(f => f.timestamp?.seconds)
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

  let streak = 1;
  let best = 1;
  let prev = new Date(sorted[0].timestamp.seconds * 1000);

  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i].timestamp.seconds * 1000);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff <= 1.5) {
      streak++;
    } else {
      best = Math.max(best, streak);
      streak = 1;
    }
    prev = curr;
  }
  best = Math.max(best, streak);
  return { current: streak, best };
}

// For demo: some achievement badges
const achievementBadges = [
  { icon: "flame", label: "7-day Streak", achieved: true },
  { icon: "star", label: "First Flex", achieved: true },
  { icon: "medal", label: "30 Flexes", achieved: false },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [myFlexes, setMyFlexes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split("@")[0] || "");
  const [avatar, setAvatar] = useState(user?.photoURL || "https://randomuser.me/api/portraits/men/11.jpg");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, "flexes"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyFlexes(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Get stats
  const reactions = countReactions(myFlexes);
  const streak = getStreak(myFlexes);
  const joined = formatJoinedDate(user);

  // Extract unique categories from flexes
  const categories = Array.from(
    new Set(myFlexes.map(flex => flex.category || "Other"))
  );

  // Category filter
  const filteredFlexes = selectedCategory
    ? myFlexes.filter(flex => flex.category === selectedCategory)
    : myFlexes;

  // Handle avatar/display name update
  const handleSaveProfile = async () => {
    try {
      await updateProfile(user!, {
        displayName,
        photoURL: avatar,
      });
      setEditing(false);
      Alert.alert("Profile updated!");
    } catch (e: any) {
      Alert.alert("Failed to update profile", e.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  // Demo avatar change: just toggles image (replace with real picker if you want)
  const handleChangeAvatar = () => {
    setAvatar(avatar.includes("women")
      ? "https://randomuser.me/api/portraits/men/11.jpg"
      : "https://randomuser.me/api/portraits/women/12.jpg");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* User Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleChangeAvatar}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View style={styles.avatarEditIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.username}>@{user?.email?.split("@")[0]}</Text>
        <Text style={styles.bio}>{bio || "“Keep pushing forward.”"}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
          <Ionicons name="create-outline" size={16} color="#42527E" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#ED5A6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsRow}>
        <View style={styles.statsBox}>
          <Ionicons name="grid" size={22} color="#76ABFF" />
          <Text style={styles.statsVal}>{myFlexes.length}</Text>
          <Text style={styles.statsLabel}>Flexes</Text>
        </View>
        <View style={styles.statsBox}>
          <MaterialCommunityIcons name="fire" size={22} color="#F59C1D" />
          <Text style={styles.statsVal}>{streak.current}</Text>
          <Text style={styles.statsLabel}>Streak</Text>
        </View>
        <View style={styles.statsBox}>
          <Ionicons name="heart" size={21} color="#ED5A6B" />
          <Text style={styles.statsVal}>
            {reactions.heart + reactions.fire + reactions.clap}
          </Text>
          <Text style={styles.statsLabel}>Reactions</Text>
        </View>
        <View style={styles.statsBox}>
          <Ionicons name="calendar" size={21} color="#5C77E0" />
          <Text style={styles.statsVal}>{joined}</Text>
          <Text style={styles.statsLabel}>Joined</Text>
        </View>
      </View>

      {/* Tracked Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catBadge,
              { backgroundColor: categoryColors[cat] || "#C6C8D0" },
              selectedCategory === cat && { borderWidth: 2, borderColor: "#42527E" },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            <Text style={styles.catText}>{cat}</Text>
          </TouchableOpacity>
        ))}
        {selectedCategory && (
          <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.clearFilterBtn}>
            <Ionicons name="close-circle" size={19} color="#ED5A6B" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Flex History */}
      <Text style={styles.sectionTitle}>Your Flexes</Text>
      {loading ? (
        <ActivityIndicator color="#ED5A6B" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filteredFlexes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.flexCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.flexCaption}>{item.caption}</Text>
                <View style={[
                  styles.flexBadge,
                  { backgroundColor: categoryColors[item.category] || "#C6C8D0" },
                ]}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>{item.category}</Text>
                </View>
              </View>
              {item.image ? <Image source={{ uri: item.image }} style={styles.flexImage} /> : null}
              <View style={styles.flexMetaRow}>
                <Text style={styles.flexDate}>
                  {item.timestamp?.seconds
                    ? new Date(item.timestamp.seconds * 1000).toLocaleString()
                    : ""}
                </Text>
                <View style={styles.flexReactions}>
                  <Ionicons name="heart-outline" size={15} color="#ED5A6B" />
                  <Text style={styles.flexReactionCount}>{item.reactions?.heart || 0}</Text>
                  <MaterialCommunityIcons name="fire" size={15} color="#F59C1D" />
                  <Text style={styles.flexReactionCount}>{item.reactions?.fire || 0}</Text>
                  <Ionicons name="hand-left-outline" size={14} color="#44C9B6" />
                  <Text style={styles.flexReactionCount}>{item.reactions?.clap || 0}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>No flexes yet!</Text>}
          contentContainerStyle={{ paddingBottom: 70 }}
        />
      )}

      {/* Achievements/Badges */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.badgesRow}>
        {achievementBadges.map(badge => (
          <View key={badge.label} style={[styles.badgeBox, !badge.achieved && { opacity: 0.45 }]}>
            <Ionicons name={badge.icon as any} size={26} color="#ED5A6B" />
            <Text style={styles.badgeLabel}>{badge.label}</Text>
          </View>
        ))}
      </View>

      {/* Edit Modal */}
      <Modal visible={editing} transparent animationType="slide">
        <View style={styles.editModal}>
          <View style={styles.editModalInner}>
            <Text style={{ fontWeight: "bold", fontSize: 19, color: "#42527E" }}>Edit Profile</Text>
            <TextInput
              placeholder="Display Name"
              style={styles.editInput}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={22}
            />
            <TextInput
              placeholder="Bio"
              style={styles.editInput}
              value={bio}
              onChangeText={setBio}
              maxLength={90}
            />
            {/* Demo avatar change */}
            <TouchableOpacity onPress={handleChangeAvatar} style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={18} color="#42527E" />
              <Text style={{ color: "#42527E", marginLeft: 5 }}>Change Avatar</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: "#B0B7C3", marginLeft: 12 }]}
                onPress={() => setEditing(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB" },
  profileHeader: {
    alignItems: "center",
    paddingTop: 42,
    paddingBottom: 16,
    backgroundColor: "#EAF3FF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 9,
    borderWidth: 2,
    borderColor: "#ED5A6B",
  },
  avatarEditIcon: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "#ED5A6B",
    borderRadius: 9,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  name: { fontSize: 22, fontWeight: "700", color: "#42527E" },
  username: { fontSize: 14, color: "#7C869A", marginBottom: 3 },
  bio: { color: "#42527E", fontStyle: "italic", fontSize: 13, marginBottom: 6 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    paddingVertical: 7,
    paddingHorizontal: 17,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#76ABFF",
    marginBottom: 5,
  },
  editText: { color: "#42527E", fontWeight: "600", marginLeft: 5 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ED5A6B",
  },
  logoutText: { color: "#ED5A6B", fontWeight: "600", marginLeft: 5 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 13,
    marginHorizontal: 6,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    shadowColor: "#191970",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 1,
  },
  statsBox: { alignItems: "center", flex: 1 },
  statsVal: { fontWeight: "bold", fontSize: 17, color: "#42527E", marginTop: 2 },
  statsLabel: { color: "#7C869A", fontSize: 12 },
  catRow: { flexDirection: "row", marginBottom: 7, marginLeft: 10 },
  catBadge: {
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 6,
    marginRight: 7,
    backgroundColor: "#D3D3D3",
    marginBottom: 2,
  },
  catText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  clearFilterBtn: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    backgroundColor: "#fff",
    borderRadius: 11,
    width: 28,
    height: 28,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#ED5A6B",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#42527E",
    marginLeft: 18,
    marginTop: 10,
    marginBottom: 5,
  },
  flexCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 15,
    padding: 13,
    shadowColor: "#191970",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  flexCaption: { fontSize: 16, color: "#344053", marginBottom: 5, flex: 1 },
  flexBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 7,
    backgroundColor: "#C6C8D0",
  },
  flexImage: { width: "100%", height: 120, borderRadius: 10, marginTop: 6, marginBottom: 4 },
  flexMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  flexDate: { fontSize: 12, color: "#B0B7C3" },
  flexReactions: { flexDirection: "row", alignItems: "center", gap: 7 },
  flexReactionCount: { fontSize: 13, color: "#888", marginLeft: 2, marginRight: 6 },
  badgesRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 18,
    gap: 16,
    flexWrap: "wrap",
  },
  badgeBox: {
    backgroundColor: "#fff",
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#191970",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 9,
  },
  badgeLabel: { color: "#ED5A6B", fontSize: 13, fontWeight: "600", marginTop: 4 },
  editModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(40,42,62,0.15)",
  },
  editModalInner: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    width: 320,
    alignItems: "center",
    shadowColor: "#191970",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 3,
  },
  editInput: {
    width: "100%",
    borderColor: "#E0E4EF",
    borderWidth: 1.2,
    borderRadius: 11,
    backgroundColor: "#F6F9FB",
    padding: 10,
    fontSize: 15,
    marginTop: 12,
    marginBottom: 2,
  },
  editAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginTop: 14,
  },
  saveBtn: {
    backgroundColor: "#76ABFF",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 22,
    alignItems: "center",
    marginTop: 2,
  },
});

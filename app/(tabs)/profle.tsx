import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { auth, db } from "../../firebase";

const categoryColors: Record<string, string> = {
  Study: "#6DC1E6",
  Fitness: "#65C18C",
  Food: "#ED5A6B",
  Social: "#C698F3",
  Other: "#D3D3D3",
  Default: "#C6C8D0",
};

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [myFlexes, setMyFlexes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split("@")[0] || "");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(user?.photoURL || "https://randomuser.me/api/portraits/men/11.jpg");
  const [isPrivate, setIsPrivate] = useState(false);

  // Followers/following placeholders (replace with Firestore logic if needed)
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);

  // Fetch user bio/avatar/privacy
  useEffect(() => {
    if (!user) return;
    (async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setBio(userDoc.data().bio || "");
        setIsPrivate(!!userDoc.data().private);
        setFollowers(userDoc.data().followers || 0); // If you store these in Firestore
        setFollowing(userDoc.data().following || 0);
      }
    })();
  }, [user]);

  // Load user's flexes
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


  // Stats helpers
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

  const reactions = countReactions(myFlexes);
  const streak = getStreak(myFlexes);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Ionicons name="chevron-back" size={25} color="#42527E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={24} color="#42527E" />
        </TouchableOpacity>
      </View>

      {/* Username (with lock if private) */}
      <View style={styles.usernameRow}>
        <Text style={styles.username}>
          {user?.email?.split("@")[0]}
        </Text>
        {isPrivate && (
          <Ionicons name="lock-closed-outline" size={16} color="#42527E" style={{ marginLeft: 4, marginTop: 2 }} />
        )}
      </View>

      {/* Avatar */}
      <View style={{ alignItems: "center" }}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </View>

      {/* Bio */}
      {bio ? <Text style={styles.bioCenter}>{bio}</Text> : null}

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatNum label="Flexes" value={myFlexes.length} />
        <StatNum label="Followers" value={followers} />
        <StatNum label="Following" value={following} />
      </View>

      {/* Edit Profile */}
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/edit-profile")}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Flexes */}
      <Text style={styles.sectionTitle}>Your Flexes</Text>
      {loading ? (
        <ActivityIndicator color="#ED5A6B" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={myFlexes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FlexCard item={item} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 36 }}>
              <Ionicons name="document-text-outline" size={44} color="#B0B7C3" />
              <Text style={{ color: "#888", fontSize: 16, marginTop: 10 }}>No flexes yet!</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 70 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// --- Stats Box ---
function StatNum({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// --- Flex Card ---
function FlexCard({ item }: any) {
  return (
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
          <Ionicons name="flame-outline" size={15} color="#F59C1D" />
          <Text style={styles.flexReactionCount}>{item.reactions?.fire || 0}</Text>
          <Ionicons name="hand-left-outline" size={14} color="#44C9B6" />
          <Text style={styles.flexReactionCount}>{item.reactions?.clap || 0}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 5,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 2,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: "#344053",
    letterSpacing: 0.5,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#ED5A6B",
    marginTop: 2,
    marginBottom: 4,
  },
  bioCenter: {
    alignSelf: "center",
    color: "#42527E",
    fontSize: 13,
    marginBottom: 8,
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: "85%",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 8,
  },
  statBox: { alignItems: "center", marginHorizontal: 20 },
  statValue: { fontWeight: "bold", fontSize: 16, color: "#42527E" },
  statLabel: { color: "#7C869A", fontSize: 12, marginTop: 2 },
  editBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#76ABFF",
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  editBtnText: { color: "#42527E", fontWeight: "600" },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#42527E",
    marginLeft: 18,
    marginTop: 18,
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
  flexReactions: { flexDirection: "row", alignItems: "center" },
  flexReactionCount: { fontSize: 13, color: "#888", marginLeft: 2, marginRight: 6 },
});


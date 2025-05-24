import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebase";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split("@")[0] || "");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(user?.photoURL || "https://randomuser.me/api/portraits/men/11.jpg");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setBio(docSnap.data().bio || "");
      }
    })();
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile(user!, {
        displayName,
        photoURL: avatar,
      });
      await setDoc(doc(db, "users", user!.uid), { bio }, { merge: true });
      Alert.alert("Saved!", "Your profile has been updated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F9FB" }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#42527E" />
          </TouchableOpacity>
          <Text style={styles.header}>Edit Profile</Text>
          <View style={{ width: 25 }} />
        </View>
        <View style={{ alignItems: "center", marginVertical: 24 }}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </View>
        <Text style={styles.label}>Avatar URL</Text>
        <TextInput
          value={avatar}
          onChangeText={setAvatar}
          style={styles.input}
          placeholder="Paste image URL"
        />
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          placeholder="Enter your name"
        />
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[styles.input, { height: 70 }]}
          placeholder="Enter your bio"
          multiline
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 12 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  header: { fontSize: 20, fontWeight: "700", color: "#42527E" },
  label: { fontSize: 14, color: "#42527E", marginTop: 14, marginBottom: 2, fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderColor: "#E0E4EF",
    borderWidth: 1.2,
    borderRadius: 11,
    padding: 11,
    fontSize: 15,
    marginBottom: 5,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: "#ED5A6B" },
  saveBtn: {
    backgroundColor: "#76ABFF",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 24,
  },
});

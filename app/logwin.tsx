import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db, storage } from "../firebase";

const CATEGORIES = [
  { label: "Fitness", color: "#65C18C" },
  { label: "Study", color: "#6DC1E6" },
  { label: "Food", color: "#ED5A6B" },
  { label: "Social", color: "#C698F3" },
  { label: "Other", color: "#D3D3D3" },
];

export default function LogWinScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const user = auth.currentUser;
    const storageRef = ref(storage, `flexes/${user?.uid}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      Alert.alert("Add a caption for your flex!");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImageAsync(image);
      }
      await addDoc(collection(db, "flexes"), {
        userId: user?.uid,
        user: user?.email?.split("@")[0] || "User",
        avatar: user?.photoURL || "https://randomuser.me/api/portraits/men/11.jpg",
        caption,
        category,
        image: imageUrl,
        timestamp: serverTimestamp(),
        reactions: { heart: 0, fire: 0, clap: 0, wow: 0 },
      });
      setLoading(false);
      Alert.alert("Flex logged!");
      router.replace("/home");
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error logging flex", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Log a Win</Text>
      <TextInput
        style={styles.input}
        placeholder="What did you accomplish?"
        value={caption}
        onChangeText={setCaption}
        multiline
        maxLength={140}
      />
      <View style={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.label}
            style={[
              styles.catButton,
              category === cat.label && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
            onPress={() => setCategory(cat.label)}
          >
            <Text style={[styles.catText, category === cat.label && { color: "#fff" }]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <>
            <Ionicons name="image-outline" size={24} color="#42527E" />
            <Text style={{ color: "#42527E", marginLeft: 8 }}>Add a Photo</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Post Flex</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 14 }}>
        <Text style={{ color: "#42527E", textAlign: "center" }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB", padding: 24, paddingTop: 65 },
  header: { fontSize: 26, fontWeight: "bold", color: "#42527E", marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    marginBottom: 18,
    borderColor: "#E0E4EF",
    borderWidth: 1,
    minHeight: 55,
    maxHeight: 90,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  catButton: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#C8D1E6",
    marginRight: 8,
    backgroundColor: "#F5F6FA",
    marginBottom: 5,
  },
  catText: { color: "#42527E", fontSize: 15, fontWeight: "600" },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 22,
    marginTop: 3,
  },
  imagePreview: { width: 60, height: 60, borderRadius: 10 },
  submitBtn: {
    backgroundColor: "#ED5A6B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    elevation: 1,
    shadowColor: "#ED5A6B",
    shadowOpacity: 0.17,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import uuid from "react-native-uuid";
import { auth, db, storage } from "../../firebase";

const categories = ["Study", "Fitness", "Food", "Social", "Other"];

export default function CreateFlex() {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Pick an image from the gallery or camera
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload image to Firebase Storage and get URL
  const uploadImageAsync = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageId = uuid.v4();
    const storageRef = ref(storage, `flexes/${imageId}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handlePost = async () => {
    if (!caption.trim()) {
      Alert.alert("Please enter something to flex about!");
      return;
    }
    setUploading(true);
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImageAsync(image);
      }
      const user = auth.currentUser;
      await addDoc(collection(db, "flexes"), {
        caption: caption.trim(),
        category,
        timestamp: serverTimestamp(),
        reactions: { heart: 0, fire: 0, clap: 0 },
        user: user?.displayName || user?.email?.split("@")[0] || "User",
        avatar: user?.photoURL || "https://randomuser.me/api/portraits/men/11.jpg",
        userId: user?.uid || null,
        image: imageUrl, // add image field
      });
      Keyboard.dismiss();
      setCaption("");
      setCategory(categories[0]);
      setImage(null);
      Alert.alert(
        "Flex posted!",
        "Your achievement was shared.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/home"),
          },
        ],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Flex</Text>
      <TextInput
        style={styles.input}
        placeholder="What are you proud of today?"
        value={caption}
        onChangeText={setCaption}
        multiline
        editable={!uploading}
      />

      {/* --- Category Picker --- */}
      <View style={styles.catRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, category === cat && styles.catBtnActive]}
            onPress={() => setCategory(cat)}
            disabled={uploading}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Image Picker --- */}
      <TouchableOpacity style={styles.imageBtn} onPress={handlePickImage} disabled={uploading}>
        <Ionicons name="image-outline" size={20} color="#42527E" />
        <Text style={styles.imageBtnText}>{image ? "Change Photo" : "Add a Photo"}</Text>
      </TouchableOpacity>
      {image && (
        <Image source={{ uri: image }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" style={{ marginRight: 12 }} />
        ) : (
          <Ionicons name="add-circle" size={22} color="#fff" />
        )}
        <Text style={styles.btnText}>{uploading ? "Posting..." : "Post Flex"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB", padding: 22 },
  title: { fontWeight: "bold", fontSize: 20, color: "#42527E", marginBottom: 15 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#EAF3FF",
    fontSize: 16,
    padding: 12,
    marginBottom: 16,
    minHeight: 90,
    color: "#42527E",
  },
  catRow: { flexDirection: "row", marginBottom: 18, flexWrap: "wrap", gap: 8 },
  catBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#EAF3FF",
    marginRight: 8,
    marginBottom: 4,
  },
  catBtnActive: { backgroundColor: "#76ABFF" },
  catText: { color: "#42527E", fontWeight: "500", fontSize: 14 },
  catTextActive: { color: "#fff" },
  imageBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "#EAF3FF",
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  imageBtnText: {
    marginLeft: 8,
    color: "#42527E",
    fontWeight: "600",
    fontSize: 15,
  },
  previewImage: {
    width: "100%",
    height: 190,
    borderRadius: 13,
    marginBottom: 16,
    marginTop: 5,
  },
  postBtn: {
    flexDirection: "row",
    backgroundColor: "#ED5A6B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    opacity: 1,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16, marginLeft: 8 },
});

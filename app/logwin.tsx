import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db, storage } from "../firebase";

// Only import on web to prevent errors on native!
const Webcam = Platform.OS === "web" ? require("react-webcam").default : null;

export default function LogWinScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Webcam ref for web
  const webcamRef = useRef<any>(null);

  // Launch camera on mobile
  const takePhotoMobile = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera permission needed to post a flex!");
      router.back();
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    } else {
      router.back();
    }
  };

  // Capture from webcam on web
  const captureWebcam = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      setImage(screenshot);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    // On web, uri is a base64 data URL. On native, it's a file URI.
    let blob;
    if (Platform.OS === "web") {
      const res = await fetch(uri);
      blob = await res.blob();
    } else {
      const response = await fetch(uri);
      blob = await response.blob();
    }
    const user = auth.currentUser;
    const storageRef = ref(storage, `flexes/${user?.uid}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert("You must take a photo!");
      return;
    }
    if (!caption.trim()) {
      Alert.alert("Please add a caption!");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const imageUrl = await uploadImageAsync(image);
      await addDoc(collection(db, "flexes"), {
        userId: user?.uid,
        user: user?.email?.split("@")[0] || "User",
        avatar: user?.photoURL || "https://randomuser.me/api/portraits/men/11.jpg",
        caption,
        category: "Other",
        image: imageUrl,
        timestamp: serverTimestamp(),
        reactions: { heart: 0, fire: 0, clap: 0, wow: 0 },
      });
      setLoading(false);
      Alert.alert("Flex posted!");
      router.replace("/home");
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error posting flex", e.message);
    }
  };

  // Mobile: Prompt for camera immediately
  React.useEffect(() => {
    if (Platform.OS !== "web" && !image) takePhotoMobile();
    // eslint-disable-next-line
  }, []);

  return (
    <View style={styles.container}>
      {/* Web: Webcam capture */}
      {Platform.OS === "web" && !image && Webcam && (
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user", width: 340, height: 340 }}
            style={styles.webcam}
            audio={false}
          />
          <TouchableOpacity style={styles.cameraBtn} onPress={captureWebcam}>
            <Ionicons name="camera-outline" size={26} color="#fff" />
            <Text style={styles.cameraBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
            <Text style={{ color: "#42527E", textAlign: "center" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Show image preview after capture on both platforms */}
      {image && (
        <>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity
            onPress={() => {
              setImage(null);
              if (Platform.OS !== "web") takePhotoMobile();
            }}
            style={styles.retakeBtn}
          >
            <Ionicons name="camera-outline" size={22} color="#ED5A6B" />
            <Text style={styles.retakeBtnText}>Retake Photo</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Write a caption for your win..."
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={140}
          />
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Post Flex</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: "#42527E", textAlign: "center" }}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Loading indicator while waiting for camera, etc */}
      {!image && Platform.OS !== "web" && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="#ED5A6B" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB", padding: 24, paddingTop: 40 },
  webcam: {
    width: 340,
    height: 340,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#eee",
  },
  imagePreview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    marginBottom: 20,
    marginTop: 18,
    backgroundColor: "#eee",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderColor: "#E0E4EF",
    borderWidth: 1,
    minHeight: 54,
    maxHeight: 100,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: "#ED5A6B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
    elevation: 1,
    shadowColor: "#ED5A6B",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
    marginTop: -7,
  },
  retakeBtnText: {
    color: "#ED5A6B",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
  cameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED5A6B",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 16,
  },
  cameraBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 12,
  },
});


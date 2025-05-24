import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { auth } from "../firebase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login Success!", "Welcome back!");
      router.replace("/home");
    } catch (e) {
      setError("Email and/or Password are incorrect.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.replace("/")} style={styles.backArrow}>
        <Ionicons name="arrow-back" size={26} color="#76ABFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Let's flex those goals again 🔁</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#A9B4C2"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#A9B4C2"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.actionBtn} onPress={handleLogin}>
        <Text style={styles.actionText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0E2C", padding: 24, justifyContent: "center" },
  backArrow: { position: "absolute", top: 50, left: 20 },
  title: { fontSize: 28, color: "#FFFFFF", fontWeight: "bold", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#A0B6D5", textAlign: "center", marginBottom: 24 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "#2F3E5C",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: "#76ABFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#76ABFF",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
  link: { color: "#76ABFF", fontSize: 15, textAlign: "center" },
  error: { color: "#FF7070", fontSize: 14, marginBottom: 10, textAlign: "center" },
});

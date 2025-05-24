// Forgot Password Screen - FlexFeed
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { auth } from "../firebase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setMessage("");
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent to your email.");
    } catch {
      setError("Unable to send reset email. Please check your address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
        <Ionicons name="arrow-back" size={26} color="#76ABFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>

      <TextInput
        placeholder="Email Address"
        placeholderTextColor="#A9B4C2"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <TouchableOpacity style={styles.resetBtn} onPress={handleReset} disabled={loading || !email}>
        <Text style={styles.resetText}>Send Reset Link</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E2C",
    padding: 24,
    justifyContent: "center",
  },
  backArrow: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0B6D5",
    textAlign: "center",
    marginBottom: 24,
  },
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
  resetBtn: {
    backgroundColor: "#76ABFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  resetText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  error: {
    color: "#FF7070",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  success: {
    color: "#5CE2A9",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
});

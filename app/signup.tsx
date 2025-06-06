import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../firebase";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");

    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.replace("/home");
    } catch {
      setError("Could not create account. Try again.");
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

      <Image source={require("../assets/images/logo.png")} style={styles.logoImage} resizeMode="contain" />
      <Text style={styles.logo}>Create Account</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#A9B4C2"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
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
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#A9B4C2"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signupText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottom}>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.bottomText}>
            Already have an account? <Text style={styles.bottomLink}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
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
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
    alignSelf: "center",
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  signupBtn: {
    backgroundColor: "#76ABFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  signupText: {
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
  bottom: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomText: {
    color: "#A0B6D5",
    fontSize: 15,
    textAlign: "center",
  },
  bottomLink: {
    color: "#76ABFF",
    fontWeight: "600",
  },
});

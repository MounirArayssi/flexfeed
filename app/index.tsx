import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch {
      setError("Email and/or Password are incorrect.");
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

      {/* Logo image */}
      <Image source={require("../assets/images/logo.png")} style={styles.logoImage} resizeMode="contain" />

      <TextInput
        placeholder="Username or Email"
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

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/forgot")}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.bottom}>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.bottomText}>
            Don’t have an account? <Text style={styles.bottomLink}>Create New Account</Text>
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
    width: 150,
    height: 150,
    marginBottom: 14,
    alignSelf: "center",
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 28,
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
  loginBtn: {
    backgroundColor: "#76ABFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  forgot: {
    color: "#76ABFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
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

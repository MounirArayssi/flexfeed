import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [email, setEmail] = useState(user?.email || "");
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F9FB" }}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#42527E" />
          </TouchableOpacity>
          <Text style={styles.header}>Change Password</Text>
          <View style={{ width: 25 }} />
        </View>
        <Text style={{ marginVertical: 16, color: "#42527E" }}>
          Enter your account email and we'll send a reset link.
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={false}
          placeholder="Email"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendReset} disabled={sent}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {sent ? "Email Sent!" : "Send Reset Link"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingTop: 18 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  header: { fontSize: 20, fontWeight: "700", color: "#42527E" },
  input: {
    backgroundColor: "#fff",
    borderColor: "#E0E4EF",
    borderWidth: 1.2,
    borderRadius: 11,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  sendBtn: {
    backgroundColor: "#76ABFF",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
  },
});

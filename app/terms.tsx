import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F9FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#42527E" />
          </TouchableOpacity>
          <Text style={styles.header}>Terms & Privacy</Text>
          <View style={{ width: 25 }} />
        </View>
        <Text style={{ color: "#42527E", fontSize: 14 }}>
          FlexFeed values your privacy. By using this app you agree to our terms of service and privacy policy. We do not sell your data or share your posts outside of your chosen audience.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  header: { fontSize: 20, fontWeight: "700", color: "#42527E" },
});

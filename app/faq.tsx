import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FAQScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F9FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#42527E" />
          </TouchableOpacity>
          <Text style={styles.header}>FAQ</Text>
          <View style={{ width: 25 }} />
        </View>
        <Text style={styles.q}>What is FlexFeed?</Text>
        <Text style={styles.a}>FlexFeed lets you track & share personal achievements and progress.</Text>
        <Text style={styles.q}>How do I make my account private?</Text>
        <Text style={styles.a}>Use the Private Account switch in Settings. A lock will show on your profile.</Text>
        <Text style={styles.q}>Need help?</Text>
        <Text style={styles.a}>Contact support@flexfeed.com anytime!</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  header: { fontSize: 20, fontWeight: "700", color: "#42527E" },
  q: { fontWeight: "bold", color: "#42527E", marginTop: 18, fontSize: 15 },
  a: { color: "#42527E", marginTop: 2, marginLeft: 10, fontSize: 14 },
});

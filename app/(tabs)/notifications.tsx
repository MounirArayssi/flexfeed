import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export default function Notifications() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F9FB" }}>
      <Ionicons name="notifications-outline" size={52} color="#42527E" />
      <Text style={{ marginTop: 20, fontSize: 17, color: "#42527E", fontWeight: "600" }}>No notifications yet!</Text>
    </View>
  );
}

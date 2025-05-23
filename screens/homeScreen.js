import { signOut } from "firebase/auth";
import React from "react";
import { Button, Text, View } from "react-native";
import { auth } from "../firebase";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>Welcome to FlexFeed!</Text>
      <Button title="Logout" onPress={() => signOut(auth)} />
    </View>
  );
}

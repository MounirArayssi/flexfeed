import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#42527E",
        tabBarInactiveTintColor: "#B0B7C3",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#e0e4ef",
          height: 65,
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-flex"
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={52}
              color="#ED5A6B"
              style={{
                marginBottom: 24,
                shadowColor: "#ED5A6B",
                shadowOpacity: focused ? 0.38 : 0.16,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
                elevation: focused ? 6 : 2,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "notifications" : "notifications-outline"} size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? 32 : 26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

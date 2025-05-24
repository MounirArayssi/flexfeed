import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { deleteUser, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebase";

const appVersion = Constants?.expoConfig?.version || "1.0.0";

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  // --- Private account state
  const [isPrivate, setIsPrivate] = useState(false);
  useEffect(() => {
    const fetchPrivacy = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setIsPrivate(userDoc.exists() && !!userDoc.data().private);
    };
    fetchPrivacy();
  }, [user]);

  const handleTogglePrivate = async (value: boolean) => {
    setIsPrivate(value);
    if (user) await setDoc(doc(db, "users", user.uid), { private: value }, { merge: true });
  };

  // --- Logout logic
  const [logoutModal, setLogoutModal] = useState(false);
  const handleLogout = async () => {
    setLogoutModal(false);
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e.message);
    }
  };

  // --- Delete account logic
  const [deleteModal, setDeleteModal] = useState(false);
  const handleDeleteAccount = async () => {
    setDeleteModal(false);
    try {
      if (user) {
        await deleteUser(user);
        router.replace("/login");
      }
    } catch (e: any) {
      Alert.alert(
        "Failed to delete account",
        e?.message || "Try logging out and in again, then retry. Some accounts require re-authentication."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color="#42527E" />
          </TouchableOpacity>
          <Text style={styles.header}>Settings</Text>
          <View style={{ width: 25 }} />
        </View>

        {/* Profile */}
        <SettingsSection title="Profile">
          <SettingsItem icon="person-outline" label="Edit Profile" onPress={() => router.push("/edit-profile")} />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsItem
            icon="lock-closed-outline"
            label="Private Account"
            rightComponent={
              <Switch
                value={isPrivate}
                onValueChange={handleTogglePrivate}
                thumbColor={isPrivate ? "#76ABFF" : "#B0B7C3"}
                trackColor={{ true: "#D4EAFF", false: "#D3D3D3" }}
              />
            }
          />
          <SettingsItem icon="key-outline" label="Change Password" onPress={() => router.push("/change-password")} />
          <SettingsItem icon="notifications-outline" label="Notifications" onPress={() => Alert.alert("Coming soon!", "Notification settings coming soon!")} />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsItem icon="help-circle-outline" label="FAQ" onPress={() => router.push("/faq")} />
          <SettingsItem icon="mail-outline" label="Contact Us" onPress={() => Alert.alert("Contact Us", "support@flexfeed.com")} />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingsItem icon="information-circle-outline" label="App Version" rightText={appVersion} />
          <SettingsItem icon="document-text-outline" label="Terms & Privacy Policy" onPress={() => router.push("/terms")} />
        </SettingsSection>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModal(true)}>
            <Ionicons name="log-out-outline" size={18} color="#ED5A6B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteModal(true)}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setLogoutModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnDanger} onPress={handleLogout}>
                <Text style={styles.modalBtnDangerText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={deleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete account?</Text>
            <Text style={styles.modalText}>This action is permanent. All your data will be lost.</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setDeleteModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnDanger} onPress={handleDeleteAccount}>
                <Text style={styles.modalBtnDangerText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Helper components ---
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBox}>{children}</View>
    </View>
  );
}

function SettingsItem({
  icon,
  label,
  onPress,
  rightText,
  rightComponent,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  rightText?: string;
  rightComponent?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightComponent}
    >
      <Ionicons name={icon} size={21} color="#42527E" style={{ marginRight: 12 }} />
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      {rightComponent ||
        (rightText ? (
          <Text style={styles.rightText}>{rightText}</Text>
        ) : (
          onPress && <Ionicons name="chevron-forward" size={18} color="#B0B7C3" />
        ))}
    </TouchableOpacity>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FB" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 15,
    marginBottom: 12,
  },
  header: { fontSize: 20, fontWeight: "700", color: "#42527E" },
  section: { marginBottom: 22, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, color: "#7C869A", fontWeight: "600", marginBottom: 5 },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 13,
    overflow: "hidden",
    shadowColor: "#191970",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  itemLabel: { fontSize: 15, color: "#42527E", fontWeight: "500" },
  rightText: { fontSize: 13, color: "#888", fontWeight: "600" },
  dangerZone: {
    marginTop: 24,
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ED5A6B",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 34,
    marginBottom: 4,
  },
  logoutText: { color: "#ED5A6B", fontWeight: "700", fontSize: 15, marginLeft: 8 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED5A6B",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 34,
  },
  deleteText: { color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 8 },
  // --- Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(36,44,62,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 26,
    width: 310,
    shadowColor: "#191970",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#42527E", marginBottom: 10, textAlign: "center" },
  modalText: { fontSize: 15, color: "#42527E", marginBottom: 12, textAlign: "center" },
  modalBtns: { flexDirection: "row", justifyContent: "center", marginTop: 5 },
  modalBtnCancel: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B0B7C3",
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginRight: 12,
  },
  modalBtnCancelText: { color: "#42527E", fontWeight: "bold" },
  modalBtnDanger: {
    borderRadius: 10,
    backgroundColor: "#ED5A6B",
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  modalBtnDangerText: { color: "#fff", fontWeight: "bold" },
});

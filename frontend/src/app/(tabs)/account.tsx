import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/use-theme-colors";

const MY_REPORTS = [
  { id: "1", title: "Pothole on Main Street", status: "In Review", date: "Jun 12", icon: "alert-circle-outline", iconColor: "#007AFF", iconBg: "#E6F1FB" },
  { id: "2", title: "Street Light Not Working", status: "Resolved", date: "Jun 11", icon: "bulb-outline", iconColor: "#3B6D11", iconBg: "#EAF3DE" },
  { id: "3", title: "Garbage Cleanup Needed", status: "In Progress", date: "Jun 9", icon: "trash-outline", iconColor: "#854F0B", iconBg: "#FAEEDA" },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Resolved": return { color: "#3B6D11", backgroundColor: "#EAF3DE" };
    case "In Progress": return { color: "#854F0B", backgroundColor: "#FAEEDA" };
    default: return { color: "#185FA5", backgroundColor: "#E6F1FB" };
  }
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, background: backgroundColor, text: textColor, secondaryText: secondaryTextColor, border: borderColor, surface: surfaceColor } = useThemeColors();

  const settingsItems = [
    { icon: "notifications-outline", label: "Notifications" },
    { icon: "lock-closed-outline", label: "Privacy" },
    { icon: "language-outline", label: "Language" },
    { icon: "help-circle-outline", label: "Help & Support" },
    { icon: "information-circle-outline", label: "About" },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: surfaceColor }]}>
          <View style={[styles.avatar, { backgroundColor: isDark ? "#333" : "#e0e0e0" }]}>
            <Text style={[styles.avatarText, { color: textColor }]}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: textColor }]}>John Doe</Text>
            <Text style={[styles.profileEmail, { color: secondaryTextColor }]}>john@example.com</Text>
            <Text style={[styles.profilePhone, { color: secondaryTextColor }]}>+977 9812345678</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { borderColor }]}>
            <Ionicons name="pencil-outline" size={16} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* My reports */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>My Reports</Text>
          <View style={[styles.reportsCard, { backgroundColor: surfaceColor }]}>
            {MY_REPORTS.map((item, index) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.reportRow,
                    index < MY_REPORTS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: borderColor },
                  ]}
                >
                  <View style={[styles.reportIcon, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon as any} size={17} color={item.iconColor} />
                  </View>
                  <View style={styles.reportContent}>
                    <Text style={[styles.reportTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.reportDate, { color: secondaryTextColor }]}>{item.date}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusPillText, { color: statusStyle.color }]}>{item.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Settings</Text>
          <View style={[styles.settingsCard, { backgroundColor: surfaceColor }]}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.settingsRow,
                  index < settingsItems.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: borderColor },
                ]}
                activeOpacity={0.6}
              >
                <Ionicons name={item.icon as any} size={19} color={secondaryTextColor} />
                <Text style={[styles.settingsLabel, { color: textColor }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={secondaryTextColor} style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: "#E24B4A" }]}
            onPress={() => Alert.alert("Log out", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Log out", style: "destructive", onPress: () => console.log("Logged out") },
            ])}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={19} color="#E24B4A" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 20 },

  // Profile
  profileCard: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: "700" },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 17, fontWeight: "700" },
  profileEmail: { fontSize: 12 },
  profilePhone: { fontSize: 12 },
  editBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 0.5, alignItems: "center", justifyContent: "center" },

  // Section
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "bold" },

  // Reports
  reportsCard: { borderRadius: 12, overflow: "hidden" },
  reportRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  reportIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  reportContent: { flex: 1, minWidth: 0 },
  reportTitle: { fontSize: 13, fontWeight: "600" },
  reportDate: { fontSize: 11, marginTop: 2 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, flexShrink: 0 },
  statusPillText: { fontSize: 10, fontWeight: "600" },

  // Settings
  settingsCard: { borderRadius: 12, overflow: "hidden" },
  settingsRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  settingsLabel: { flex: 1, fontSize: 14 },
  chevron: { marginLeft: "auto" },

  // Logout
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#E24B4A" },
});
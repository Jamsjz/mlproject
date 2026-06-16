import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, StatusBar, ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useFocusEffect } from "expo-router";
import { getMyProfile, getRecentReports } from "@/services/apiService";

const CATEGORIES = [
  { id: "road", label: "Road", icon: "car-outline" },
  { id: "lighting", label: "Lighting", icon: "bulb-outline" },
  { id: "waste", label: "Waste", icon: "trash-outline" },
  { id: "water", label: "Water", icon: "water-outline" },
  { id: "park", label: "Park", icon: "leaf-outline" },
  { id: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("");
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark, background: backgroundColor, text: textColor, secondaryText: secondaryTextColor, border: borderColor, surface: surfaceColor } = useThemeColors();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const profile = await getMyProfile();
          setUserName(profile.name.split(" ")[0]);
          
          const reports = await getRecentReports();
          setRecentComplaints(reports.map((r: any) => ({
            id: r._id,
            title: r.description,
            community: r.location,
            status: r.status,
            date: new Date(r.created_at).toLocaleDateString(),
            icon: CATEGORIES.find(c => c.id === r.category)?.icon || 'alert-circle-outline',
            iconColor: "#007AFF",
            iconBg: "#E6F1FB"
          })));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const getGreeting = () => {
    const now = new Date();
    const nepalOffset = 5 * 60 + 45; // minutes
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const nepalTime = new Date(utc + nepalOffset * 60000);
    const hour = nepalTime.getHours();
    if (hour >= 5 && hour < 12) return "Good morning,";
    if (hour >= 12 && hour < 17) return "Good afternoon,";
    if (hour >= 17 && hour < 21) return "Good evening,";
    return "Good night,";
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const stats: Array<{ label: string, value: number, badge: string, color: string, bgColor: string }> = [];
  const latestActivity: Array<{ id: string, action: string, target: string, time: string, icon: string, color: string, bgColor: string }> = [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Resolved": return { color: "#3B6D11", backgroundColor: "#EAF3DE" };
      case "In Progress": return { color: "#854F0B", backgroundColor: "#FAEEDA" };
      default: return { color: "#185FA5", backgroundColor: "#E6F1FB" };
    }
  };

  const renderComplaintCard = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={[styles.complaintCard, { backgroundColor, borderColor }]} activeOpacity={0.7}>
        <View style={[styles.complaintIcon, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
        </View>
        <View style={styles.complaintContent}>
          <Text style={[styles.complaintTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
          <View style={styles.complaintMeta}>
            <Ionicons name="location-outline" size={11} color={secondaryTextColor} />
            <Text style={[styles.complaintSubtitle, { color: secondaryTextColor }]}>{item.community}</Text>
          </View>
        </View>
        <View style={styles.complaintRight}>
          <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusPillText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
          <Text style={[styles.complaintDate, { color: secondaryTextColor }]}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: surfaceColor }]}>
              {loading ? <ActivityIndicator size="small" /> : <Text style={[styles.avatarText, { color: secondaryTextColor }]}>{getInitials(userName)}</Text>}
            </View>
            <View>
              <Text style={[styles.greeting, { color: secondaryTextColor }]}>{getGreeting()}</Text>
              <Text style={[styles.userName, { color: textColor }]}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.notifBtn, { borderColor }]}>
            <Ionicons name="notifications-outline" size={20} color={textColor} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {stats.length > 0 && (
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: surfaceColor }]}>
                <Text style={[styles.statNum, { color: textColor }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: secondaryTextColor }]}>{stat.label}</Text>
                <View style={[styles.statBadge, { backgroundColor: stat.bgColor }]}>
                  <Text style={[styles.statBadgeText, { color: stat.color }]}>{stat.badge}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Complaints */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Recent complaints</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator />
          ) : recentComplaints.length === 0 ? (
            <Text style={{ color: secondaryTextColor, marginTop: 10 }}>No recent complaints.</Text>
          ) : (
            <FlatList
              data={recentComplaints}
              renderItem={renderComplaintCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "600" },
  greeting: { fontSize: 12 },
  userName: { fontSize: 20, fontWeight: "bold" },
  notifBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 0.5, alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#E24B4A", borderWidth: 1.5, borderColor: "#ffffff" },
  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  statCard: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 10, marginTop: 1 },
  statBadge: { marginTop: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  statBadgeText: { fontSize: 9, fontWeight: "600" },
  section: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 15, fontWeight: "bold" },
  seeAll: { fontSize: 13, color: "#185FA5", fontWeight: "500" },
  divider: { height: 0.5, marginHorizontal: 16, marginBottom: 16 },
  complaintCard: { borderWidth: 0.5, borderRadius: 12, padding: 11, flexDirection: "row", alignItems: "center", gap: 10 },
  complaintIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  complaintContent: { flex: 1, minWidth: 0, gap: 3 },
  complaintTitle: { fontSize: 13, fontWeight: "600" },
  complaintMeta: { flexDirection: "row", alignItems: "center", gap: 3 },
  complaintSubtitle: { fontSize: 11 },
  complaintRight: { alignItems: "flex-end", gap: 4, flexShrink: 0 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  statusPillText: { fontSize: 10, fontWeight: "600" },
  complaintDate: { fontSize: 10 },
});
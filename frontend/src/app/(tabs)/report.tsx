import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, StyleSheet, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { createReport } from "@/services/apiService";
import { useRouter } from "expo-router";

// Dynamically import MapView and Location so it doesn't break on web
let MapView: any = null;
let Marker: any = null;
let Location: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Location = require('expo-location');
}

const CATEGORIES = [
  { id: "road", label: "Road", icon: "car-outline" },
  { id: "lighting", label: "Lighting", icon: "bulb-outline" },
  { id: "waste", label: "Waste", icon: "trash-outline" },
  { id: "water", label: "Water", icon: "water-outline" },
  { id: "park", label: "Park", icon: "leaf-outline" },
  { id: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
];

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);

  const { isDark, background: backgroundColor, text: textColor, secondaryText: secondaryTextColor, border: borderColor, surface: surfaceColor, placeholder: placeholderColor } = useThemeColors();

  useEffect(() => {
    if (showForm && Platform.OS !== "web") {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          } catch (error) {
            console.warn("Location unavailable, falling back to default:", error);
            // Fallback to Kathmandu coordinates if emulator location is completely disabled
            setCoords({ latitude: 27.7172, longitude: 85.3240 });
          }
        }
      })();
    }
  }, [showForm]);

  const handleCameraPress = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not supported", "Camera is not available on web.");
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      setShowForm(true);
    }
  };

  const handleGalleryPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      setShowForm(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return Alert.alert("Required", "Please select a category");
    if (!locationName.trim()) return Alert.alert("Required", "Please enter a location name");
    if (!description.trim()) return Alert.alert("Required", "Please describe the issue");

    setLoading(true);
    try {
      await createReport({
        category: selectedCategory,
        description: description,
        location: locationName,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      Alert.alert("Submitted!", "Your report has been received.", [{ 
        text: "OK", 
        onPress: () => {
          handleReset();
          router.replace("/(tabs)");
        } 
      }]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setShowForm(false);
    setSelectedCategory(null);
    setDescription("");
    setLocationName("");
    setCoords(null);
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, showForm && { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!showForm ? (
          <View style={styles.pickScreen}>
            <View style={[styles.uploadBox, { backgroundColor: surfaceColor }]}>
              <View style={[styles.uploadIconCircle, { borderColor }]}>
                <Ionicons name="camera-outline" size={40} color={secondaryTextColor} />
              </View>
              <Text style={[styles.uploadTitle, { color: textColor }]}>Upload an image</Text>
              <Text style={[styles.uploadSub, { color: secondaryTextColor }]}>
                Take a photo or choose from your gallery to start reporting an issue
              </Text>
            </View>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: textColor }]} onPress={handleCameraPress} activeOpacity={0.85}>
              <Ionicons name="camera" size={20} color={backgroundColor} />
              <Text style={[styles.primaryBtnText, { color: backgroundColor }]}>Take photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryBtn, { borderColor }]} onPress={handleGalleryPress} activeOpacity={0.85}>
              <Ionicons name="image-outline" size={20} color={textColor} />
              <Text style={[styles.secondaryBtnText, { color: textColor }]}>Choose from gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            {capturedImage && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => { setCapturedImage(null); setShowForm(false); }}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View>
              <Text style={[styles.label, { color: textColor }]}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.chip, { backgroundColor: active ? textColor : surfaceColor, borderColor: active ? textColor : borderColor }]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Ionicons name={cat.icon as any} size={15} color={active ? backgroundColor : secondaryTextColor} />
                      <Text style={[styles.chipLabel, { color: active ? backgroundColor : textColor }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>Location Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: textColor, borderColor }]}
                placeholder="e.g. Bagbazar, Kathmandu"
                placeholderTextColor={placeholderColor}
                value={locationName}
                onChangeText={setLocationName}
              />
            </View>

            {MapView && coords && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: textColor }]}>Map Location</Text>
                <View style={{ height: 150, borderRadius: 10, overflow: 'hidden' }}>
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                    onPress={(e: any) => setCoords(e.nativeEvent.coordinate)}
                  >
                    <Marker coordinate={coords} />
                  </MapView>
                </View>
                <Text style={{ fontSize: 10, color: secondaryTextColor }}>Tap on the map to adjust location.</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={[styles.label, { color: textColor }]}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: surfaceColor, color: textColor, borderColor }]}
                placeholder="Describe the issue in detail"
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {showForm && (
        <View style={[styles.stickyBar, { backgroundColor, borderTopColor: borderColor, paddingBottom: insets.bottom || 12 }]}>
          <TouchableOpacity style={[styles.cancelBtn, { borderColor }]} onPress={handleReset} disabled={loading}>
            <Text style={[styles.cancelText, { color: textColor }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: textColor }, loading && styles.disabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={backgroundColor} />
              : <Text style={[styles.submitText, { color: backgroundColor }]}>Submit report</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  pickScreen: { flex: 1, gap: 12 },
  uploadBox: { borderRadius: 16, padding: 32, alignItems: "center", gap: 12, marginBottom: 8 },
  uploadIconCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  uploadTitle: { fontSize: 17, fontWeight: "600" },
  uploadSub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 8 },
  primaryBtnText: { fontSize: 15, fontWeight: "600" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 13, borderRadius: 12, borderWidth: 0.5, gap: 8 },
  secondaryBtnText: { fontSize: 15, fontWeight: "500" },
  formSection: { gap: 16 },
  imageWrapper: { position: "relative" },
  previewImage: { width: "100%", height: 220, borderRadius: 12 },
  removeBtn: { position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  chipsRow: { gap: 8, paddingVertical: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5 },
  chipLabel: { fontSize: 13, fontWeight: "500" },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: { borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  textArea: { textAlignVertical: "top", paddingTop: 11, minHeight: 100 },
  stickyBar: { flexDirection: "row", gap: 10, padding: 12, borderTopWidth: 0.5 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 0.5, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 15, fontWeight: "500" },
  submitBtn: { flex: 2, paddingVertical: 13, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 15, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
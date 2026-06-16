import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerBasicInfo } from '@/services/authService';
import { validateEmail } from '@/utils/validation';
import { useAuthStyles } from '@/constants/authStyles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const TOTAL_STEPS = 5;

export default function BasicInfoScreen() {
  const router = useRouter();
  const styles = useAuthStyles();
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [photoUrl, setPhotoUrl]       = useState('');
  const [loading, setLoading]         = useState(false);

  const handleNext = async () => {
    if (!name.trim())        { Alert.alert('Error', 'Name is required'); return; }
    const emailError = validateEmail(email);
    if (emailError)          { Alert.alert('Error', emailError); return; }
    if (!citizenship.trim()) { Alert.alert('Error', 'Citizenship number is required'); return; }

    setLoading(true);
    try {
      const data = await registerBasicInfo(name, email, citizenship, photoUrl || undefined);
      router.push({ pathname: '/register/phone', params: { registration_id: data.registration_id } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* Step indicators */}
        <View style={styles.stepIndicatorRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={i === 0 ? styles.stepDotActive : styles.stepDot} />
          ))}
        </View>

        <ThemedText type="subtitle" style={styles.title}>Basic Info</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.step}>
          Step 1 of 5 — Let's get started
        </ThemedText>

        <View style={styles.inputContainer}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Full Name</ThemedText>
          <TextInput style={styles.input} placeholder="John Doe"
            placeholderTextColor="#aaa" value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Email</ThemedText>
          <TextInput style={styles.input} placeholder="you@example.com"
            placeholderTextColor="#aaa" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Citizenship Number</ThemedText>
          <TextInput style={styles.input} placeholder="12345678"
            placeholderTextColor="#aaa" value={citizenship} onChangeText={setCitizenship} />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Citizenship Photo URL (optional)</ThemedText>
          <TextInput style={styles.input} placeholder="https://..."
            placeholderTextColor="#aaa" value={photoUrl} onChangeText={setPhotoUrl}
            autoCapitalize="none" />
        </View>

        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photoPreview} resizeMode="cover" />
        ) : (
          <TouchableOpacity style={styles.photoButton}>
            <ThemedText type="small" themeColor="textSecondary">📷  Add Citizenship Photo</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={styles.buttonText}>Continue →</ThemedText>}
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <ThemedText type="small" themeColor="textSecondary">Already have an account?</ThemedText>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <ThemedText type="smallBold"> Sign In</ThemedText>
          </TouchableOpacity>
        </View>

      </View>
    </ThemedView>
  );
}
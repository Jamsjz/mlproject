import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { registerPhone } from '@/services/authService';
import { validatePhone } from '@/utils/validation';
import { useAuthStyles } from '@/constants/authStyles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PhoneScreen() {
  const router = useRouter();
  const styles = useAuthStyles();
  const { registration_id } = useLocalSearchParams<{ registration_id: string }>();
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    const phoneError = validatePhone(phone);
    if (phoneError) { Alert.alert('Error', phoneError); return; }

    setLoading(true);
    try {
      await registerPhone(registration_id, phone);
      router.push({ pathname: '/register/verify-phone', params: { registration_id, phone } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>Phone Number</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.step}>
          Step 2 of 5 — We'll send an OTP to verify
        </ThemedText>

        <TextInput style={styles.input} placeholder="+977XXXXXXXXXX"
          placeholderTextColor="#888" value={phone} onChangeText={setPhone}
          keyboardType="phone-pad" />

        <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={styles.buttonText}>Send OTP →</ThemedText>}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
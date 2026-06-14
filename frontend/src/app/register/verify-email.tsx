import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyEmail } from '@/services/authService';
import { useAuthStyles } from '@/constants/authStyles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const styles = useAuthStyles();
  const { registration_id } = useLocalSearchParams<{ registration_id: string }>();
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) { Alert.alert('Error', 'Enter the OTP'); return; }

    setLoading(true);
    try {
      await verifyEmail(registration_id, code);
      router.push({ pathname: '/register/finalize', params: { registration_id } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>Verify Email</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.step}>
          Step 4 of 5 — Enter OTP sent to your email
        </ThemedText>

        <TextInput style={styles.input} placeholder="Enter OTP"
          placeholderTextColor="#888" value={code} onChangeText={setCode}
          keyboardType="number-pad" />

        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Use 123456 for testing
        </ThemedText>

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={styles.buttonText}>Verify →</ThemedText>}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
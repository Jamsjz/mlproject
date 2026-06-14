import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { saveToken } from '@/services/authService';
import { useAuthStyles } from '@/constants/authStyles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AUTH_ENDPOINTS } from '@/constants/api';

export default function TwoFAScreen() {
  const router = useRouter();
  const styles = useAuthStyles();
  const { login_token } = useLocalSearchParams<{ login_token: string }>();
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) { Alert.alert('Error', 'Enter the code'); return; }

    setLoading(true);
    try {
      const response = await fetch(AUTH_ENDPOINTS.verify2fa, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_token, method: 'email', code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Invalid code');
      await saveToken(data.access_token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>Two-Factor Auth</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.step}>
          Enter the code sent to your email or phone
        </ThemedText>

        <TextInput style={styles.input} placeholder="Enter code"
          placeholderTextColor="#888" value={code} onChangeText={setCode}
          keyboardType="number-pad" />

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={styles.buttonText}>Verify →</ThemedText>}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
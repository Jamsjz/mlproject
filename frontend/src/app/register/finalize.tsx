import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { finalizeRegistration, saveToken } from '@/services/authService';
import { validatePassword } from '@/utils/validation';
import { useAuthStyles } from '@/constants/authStyles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function FinalizeScreen() {
  const router = useRouter();
  const styles = useAuthStyles();
  const { registration_id } = useLocalSearchParams<{ registration_id: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleFinalize = async () => {
    const passwordError = validatePassword(password);
    if (passwordError)        { Alert.alert('Error', passwordError); return; }
    if (password !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }

    setLoading(true);
    try {
      const data = await finalizeRegistration(registration_id, password, confirm);
      await saveToken(data.access_token);
      Alert.alert('Success!', 'Your account has been created!', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>

        <ThemedText type="subtitle" style={[styles.title, { marginBottom: Spacing.one }]}>
          Set Password
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={[styles.step, { marginBottom: Spacing.two }]}>
          Step 5 of 5 — Almost done!
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={[styles.hint, { marginBottom: Spacing.four }]}>
          Min 8 chars, uppercase, lowercase, number, special character
        </ThemedText>

        {/* Password */}
        <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Password</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Confirm Password */}
        <View style={[styles.inputContainer, { marginBottom: Spacing.four }]}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Confirm Password</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleFinalize} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={styles.buttonText}>Create Account</ThemedText>}
        </TouchableOpacity>

      </View>
    </ThemedView>
  );
}
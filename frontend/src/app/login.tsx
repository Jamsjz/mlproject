import React, { useState, useEffect } from 'react';
import {
  View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser, saveToken, getToken } from '@/services/authService';
import { validateEmail } from '@/utils/validation';
import { useAuthStyles } from '@/constants/authStyles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

function LockIllustration() {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', marginBottom: Spacing.three }}>
      {/* Lock shackle */}
      <View style={{
        width: 28,
        height: 16,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        borderWidth: 4,
        borderBottomWidth: 0,
        borderColor: theme.text,
        marginBottom: -2,
      }} />
      {/* Lock body */}
      <View style={{
        width: 44,
        height: 36,
        backgroundColor: theme.text,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Keyhole circle */}
        <View style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.background,
          marginBottom: -3,
        }} />
        {/* Keyhole stem */}
        <View style={{
          width: 5,
          height: 8,
          backgroundColor: theme.background,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }} />
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const styles = useAuthStyles();
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [loading, setLoading]                 = useState(false);
  const [emailFocused, setEmailFocused]       = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = await getToken();
      if (token) router.replace('/(tabs)');
    };
    check();
  }, []);

  const handleLogin = async () => {
    const emailError = validateEmail(email);
    if (emailError) { Alert.alert('Error', emailError); return; }
    if (!password)  { Alert.alert('Error', 'Password is required'); return; }

    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.requires_2fa) {
        router.push({ pathname: '/login/two-fa', params: { login_token: data.login_token } });
      } else {
        await saveToken(data.access_token);
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* Lock + Header */}
        <View style={{ alignItems: 'center', marginBottom: Spacing.five }}>
          <LockIllustration />
          <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 6, marginTop: Spacing.two }}>
            Sign in to your account
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
            Good to see you again
          </ThemedText>
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Email</ThemedText>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={[styles.inputContainer, { marginBottom: Spacing.four }]}>
          <ThemedText type="smallBold" style={styles.inputLabel}>Password</ThemedText>
          <TextInput
            style={[styles.input, passwordFocused && styles.inputFocused]}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <ThemedText style={styles.buttonText}>Sign In</ThemedText>}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.dividerText}>or</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign Up Link */}
        <View style={styles.linkRow}>
          <ThemedText type="small" themeColor="textSecondary">New here? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/register/basic-info')}>
            <ThemedText type="smallBold">Create an account</ThemedText>
          </TouchableOpacity>
        </View>

      </View>
    </ThemedView>
  );
}
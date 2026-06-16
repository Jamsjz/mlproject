import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '@/services/authService';
import { useTheme } from '@/hooks/use-theme';

export default function EntryScreen() {
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.text} />
    </View>
  );
}

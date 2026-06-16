import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    background: isDark ? '#1a1a1a' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#999999' : '#666666',
    border: isDark ? '#333333' : '#e0e0e0',
    surface: isDark ? '#2a2a2a' : '#f5f5f5',
    placeholder: isDark ? '#666666' : '#999999',
  };
}

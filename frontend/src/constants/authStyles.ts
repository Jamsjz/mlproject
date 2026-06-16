import { StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const useAuthStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: Spacing.four,
      maxWidth: 440,
      alignSelf: 'center' as const,
      width: '100%',
    },
    logoContainer: {
      alignItems: 'center' as const,
      marginBottom: Spacing.five,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: theme.text,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: Spacing.three,
    },
    logoText: {
      fontSize: 36,
    },
    title: {
      marginBottom: Spacing.one,
      textAlign: 'center',
    },
    step: {
      marginBottom: Spacing.five,
      textAlign: 'center',
    },
    hint: {
      marginBottom: Spacing.three,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: Spacing.two,
    },
    inputLabel: {
      marginBottom: 6,
      marginLeft: 4,
    },
    input: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 14,
      paddingHorizontal: Spacing.three,
      paddingVertical: 14,
      color: theme.text,
      fontSize: 15,
      borderWidth: 1.5,
      borderColor: theme.backgroundSelected,
    },
    inputFocused: {
      borderColor: theme.text,
    },
    button: {
      backgroundColor: theme.text,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center' as const,
      marginTop: Spacing.three,
      marginBottom: Spacing.three,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: theme.background,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.3,
    },
    dividerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginVertical: Spacing.three,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.backgroundSelected,
    },
    dividerText: {
      marginHorizontal: Spacing.two,
    },
    linkRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      gap: 4,
    },
    photoButton: {
      backgroundColor: theme.backgroundElement,
      padding: Spacing.three,
      borderRadius: 14,
      alignItems: 'center' as const,
      marginBottom: Spacing.two,
      borderWidth: 1.5,
      borderColor: theme.backgroundSelected,
      borderStyle: 'dashed' as const,
    },
    photoPreview: {
      width: '100%',
      height: 150,
      borderRadius: 14,
      marginBottom: Spacing.two,
    },
    stepIndicatorRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 6,
      marginBottom: Spacing.four,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.backgroundSelected,
    },
    stepDotActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.text,
    },
  });
};
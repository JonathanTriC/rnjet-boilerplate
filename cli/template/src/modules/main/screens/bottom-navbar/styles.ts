import { ThemeType } from '@theme';
import { StyleSheet } from 'react-native';

export const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.neutral.disabled,
      paddingBottom: 8,
      paddingTop: 8,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      marginBottom: 20,
    },
    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 32,
      borderRadius: 16,
      position: 'relative',
    },
  });

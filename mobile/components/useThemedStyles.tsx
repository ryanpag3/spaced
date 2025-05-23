import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { ColorTheme } from '@/constants/Colors';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (colors: ColorTheme, isDark: boolean) => T
): T {
  const { colors, isDark } = useTheme();
  return styleCreator(colors, isDark);
}

export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (colors: ColorTheme, isDark: boolean) => T
) {
  return function useStyles(): T {
    const { colors, isDark } = useTheme();
    return styleCreator(colors, isDark);
  };
}

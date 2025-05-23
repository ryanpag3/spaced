import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import Colors, { ColorTheme } from '@/constants/Colors';

interface ThemeContextType {
  colors: ColorTheme;
  isDark: boolean;
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  forcedTheme?: 'light' | 'dark';
}

export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  const systemColorScheme = useRNColorScheme();
  const theme = forcedTheme || systemColorScheme || 'light';
  const isDark = theme === 'dark';
  const colors = Colors[theme];

  const value: ThemeContextType = {
    colors,
    isDark,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof ColorTheme
): string {
  const { colors, theme } = useTheme();
  
  const colorFromProps = props[theme];
  
  if (colorFromProps) {
    return colorFromProps;
  }
  
  if (colorName) {
    return colors[colorName] as string;
  }
  
  return colors.text;
}

export function useThemedStyles<T>(
  styleCreator: (colors: ColorTheme, isDark: boolean) => T
): T {
  const { colors, isDark } = useTheme();
  return styleCreator(colors, isDark);
}

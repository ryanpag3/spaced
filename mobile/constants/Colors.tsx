interface ColorTheme {
  text: string;
  textSecondary: string;
  textTertiary: string;
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceSecondary: string;
  
  // Interactive elements
  tint: string;
  tintSecondary: string;
  
  // Navigation & tabs
  tabIconDefault: string;
  tabIconSelected: string;
  
  // Buttons
  buttonPrimary: string;
  buttonSecondary: string;
  buttonOutline: string;
  buttonText: string;
  buttonTextSecondary: string;
  buttonDisabled: string;
  
  // Form inputs
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputText: string;
  inputPlaceholder: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Borders & dividers
  border: string;
  borderLight: string;
  divider: string;
  
  // Shadows
  shadowColor: string;
  shadowOpacity: number;
  
  // Loading & activity indicators
  activityIndicator: string;
  
  // Legacy support for backward compatibility
  buttonBackground: string;
  textInputBackground: string;
  textInputBorder: string;
  textInputText: string;
  textInputPlaceholder: string;
  textInputPlaceholderTextColor: string;
  textInputBorderColor: string;
  textInputFocusedBorderColor: string;
  authBackground: string;
  authCardBackground: string;
  authSecondaryText: string;
  authErrorText: string;
}

const TINT_COLOR_LIGHT = '#224870';
const TINT_COLOR_DARK = '#7DA8D6';

const lightTheme: ColorTheme = {
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  background: '#ffffff',
  backgroundSecondary: '#fafafa',
  backgroundTertiary: '#f3f4f6',
  surface: '#ffffff',
  surfaceSecondary: '#f9fafb',
  
  tint: TINT_COLOR_LIGHT,
  tintSecondary: '#7DA8D6',
  
  tabIconDefault: '#9ca3af',
  tabIconSelected: TINT_COLOR_LIGHT,
  
  buttonPrimary: TINT_COLOR_LIGHT,
  buttonSecondary: 'transparent',
  buttonOutline: 'transparent',
  buttonText: '#ffffff',
  buttonTextSecondary: TINT_COLOR_LIGHT,
  buttonDisabled: '#e5e7eb',
  
  inputBackground: '#ffffff',
  inputBorder: '#e5e7eb',
  inputBorderFocused: TINT_COLOR_LIGHT,
  inputText: '#1f2937',
  inputPlaceholder: '#9ca3af',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  divider: '#e5e7eb',
  
  shadowColor: '#000000',
  shadowOpacity: 0.05,
  
  activityIndicator: TINT_COLOR_LIGHT,
  
  // Legacy mappings
  buttonBackground: TINT_COLOR_LIGHT,
  textInputBackground: '#ffffff',
  textInputBorder: '#e5e7eb',
  textInputText: '#1f2937',
  textInputPlaceholder: '#9ca3af',
  textInputPlaceholderTextColor: '#9ca3af',
  textInputBorderColor: '#e5e7eb',
  textInputFocusedBorderColor: TINT_COLOR_LIGHT,
  authBackground: '#fafafa',
  authCardBackground: '#ffffff',
  authSecondaryText: '#6b7280',
  authErrorText: '#ef4444',
};

const darkTheme: ColorTheme = {
  text: '#f3f4f6',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  background: '#111827',
  backgroundSecondary: '#1f2937',
  backgroundTertiary: '#374151',
  surface: '#1f2937',
  surfaceSecondary: '#374151',
  
  tint: TINT_COLOR_DARK,
  tintSecondary: '#224870',
  
  tabIconDefault: '#6b7280',
  tabIconSelected: TINT_COLOR_DARK,
  
  buttonPrimary: TINT_COLOR_DARK,
  buttonSecondary: 'transparent',
  buttonOutline: 'transparent',
  buttonText: '#ffffff',
  buttonTextSecondary: TINT_COLOR_DARK,
  buttonDisabled: '#4b5563',
  
  inputBackground: '#1f2937',
  inputBorder: '#374151',
  inputBorderFocused: TINT_COLOR_DARK,
  inputText: '#f3f4f6',
  inputPlaceholder: '#9ca3af',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#f87171',
  info: '#60a5fa',
  
  border: '#374151',
  borderLight: '#4b5563',
  divider: '#374151',
  
  shadowColor: '#000000',
  shadowOpacity: 0.2,
  
  activityIndicator: TINT_COLOR_DARK,
  
  // Legacy mappings
  buttonBackground: TINT_COLOR_DARK,
  textInputBackground: '#1f2937',
  textInputBorder: '#374151',
  textInputText: '#f3f4f6',
  textInputPlaceholder: '#9ca3af',
  textInputPlaceholderTextColor: '#9ca3af',
  textInputBorderColor: '#374151',
  textInputFocusedBorderColor: TINT_COLOR_DARK,
  authBackground: '#0f172a',
  authCardBackground: '#1f2937',
  authSecondaryText: '#9ca3af',
  authErrorText: '#f87171',
};

export type { ColorTheme };

export default {
  light: lightTheme,
  dark: darkTheme,
};

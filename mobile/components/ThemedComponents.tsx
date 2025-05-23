/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  TouchableOpacity,
  TouchableOpacityProps,
  TextInput as DefaultTextInput
} from 'react-native';

import { useTheme, useThemeColor } from './ThemeProvider';
import { ColorTheme } from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type TextInputProps = ThemeProps & DefaultTextInput['props'];

export { useTheme, useThemeColor };

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export type ButtonProps = ThemeProps & TouchableOpacityProps & {
  variant?: 'primary' | 'secondary' | 'outline';
};

export function Button(props: ButtonProps) {
  const { style, lightColor, darkColor, variant = 'primary', disabled, ...otherProps } = props;
  const { colors } = useTheme();
  
  const getButtonStyles = () => {
    const baseStyle = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      minHeight: 56,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.buttonDisabled : colors.buttonPrimary,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: disabled ? 0 : colors.shadowOpacity,
          shadowRadius: 8,
          elevation: disabled ? 0 : 2,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.buttonSecondary,
          borderWidth: 1.5,
          borderColor: disabled ? colors.buttonDisabled : colors.tint,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: colors.buttonOutline,
          borderWidth: 1.5,
          borderColor: disabled ? colors.buttonDisabled : colors.buttonPrimary,
        };
      default:
        return baseStyle;
    }
  };
  
  const getTextColor = () => {
    if (disabled) {
      return colors.textTertiary;
    }
    
    switch (variant) {
      case 'primary':
        return colors.buttonText;
      case 'secondary':
        return colors.buttonTextSecondary;
      case 'outline':
        return colors.buttonTextSecondary;
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={disabled}
      {...otherProps} 
    >
      <Text style={{ 
        color: getTextColor(),
        fontSize: 16,
        fontWeight: '600',
      }}>
        {props.children}
      </Text>
    </TouchableOpacity>
  );
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'inputBackground');

  return (
    <DefaultTextInput
      style={[{ backgroundColor, color: colors.inputText }, style]}
      placeholderTextColor={colors.inputPlaceholder}
      {...otherProps}
    />
  );
}

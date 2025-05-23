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

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type TextInputProps = ThemeProps & DefaultTextInput['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

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
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground') as string;
  const theme = useColorScheme() ?? 'light';
  
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
          backgroundColor: disabled ? Colors[theme].tabIconDefault : backgroundColor,
          shadowColor: Colors[theme].shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: disabled ? 0 : Colors[theme].shadowOpacity,
          shadowRadius: 8,
          elevation: disabled ? 0 : 2,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? Colors[theme].tabIconDefault : Colors[theme].tint,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? Colors[theme].tabIconDefault : backgroundColor,
        };
    }
  };
  
  const getTextColor = () => {
    if (disabled) {
      return Colors[theme].tabIconDefault;
    }
    
    switch (variant) {
      case 'primary':
        return Colors[theme].buttonText;
      case 'secondary':
        return Colors[theme].tint;
      case 'outline':
        return backgroundColor;
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
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <DefaultTextInput
      style={[{ backgroundColor }, style]}
      placeholderTextColor={Colors.light.text}
      {...otherProps}
    />
  );
}

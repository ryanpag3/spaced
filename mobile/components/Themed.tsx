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
  const { style, lightColor, darkColor, variant = 'primary', ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground');
  
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          padding: 12,
          borderRadius: 8,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.light.tint,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          padding: 12,
          borderRadius: 8,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: backgroundColor,
        };
    }
  };
  
  const getTextColor = () => {
    return variant === 'outline' ? backgroundColor : Colors.light.buttonText;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      {...otherProps} 
    >
      <Text style={{ color: getTextColor() }}>{props.children}</Text>
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

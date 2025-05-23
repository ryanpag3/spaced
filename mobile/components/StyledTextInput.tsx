import { TextInputProps, StyleSheet } from 'react-native';
import { TextInput } from './Themed';
import { useThemeColor } from './Themed';
import { useState } from 'react';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export default function StyledTextInput(props: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useColorScheme() ?? 'light';
  
  const borderColor = useThemeColor({}, 'textInputBorderColor') as string;
  const backgroundColor = useThemeColor({}, 'textInputBackground') as string;
  const textColor = useThemeColor({}, 'textInputText') as string;
  const placeholderColor = useThemeColor({}, 'textInputPlaceholder') as string;
  const focusedBorderColor = Colors[theme].textInputFocusedBorderColor;

  return (
    <TextInput
      {...props}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      placeholderTextColor={placeholderColor}
      style={[
        styles.input,
        {
          backgroundColor,
          borderColor: isFocused ? focusedBorderColor : borderColor,
          color: textColor,
        },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '400',
  },
});
import { TextInputProps, StyleSheet } from 'react-native';
import { TextInput } from './Themed';
import { useTheme } from './ThemeProvider';
import { useState } from 'react';

export default function StyledTextInput(props: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();

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
      placeholderTextColor={colors.inputPlaceholder}
      style={[
        styles.input,
        {
          backgroundColor: colors.inputBackground,
          borderColor: isFocused ? colors.inputBorderFocused : colors.inputBorder,
          color: colors.inputText,
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
import { StyleSheet, TextInputProps, View } from 'react-native';
import { Text } from './Themed';
import StyledTextInput from './StyledTextInput';
import { useThemeColor } from './Themed';

type FormFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

export default function FormField({
  label,
  error,
  style,
  ...props
}: FormFieldProps) {
  const textColor = useThemeColor({}, 'text') as string;
  const errorColor = useThemeColor({}, 'authErrorText') as string;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>
          {label}
        </Text>
      )}
      <StyledTextInput style={[styles.input, style]} {...props} />
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
});

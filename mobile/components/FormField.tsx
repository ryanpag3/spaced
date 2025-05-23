import { StyleSheet, TextInputProps, View } from 'react-native';
import { Text } from './Themed';
import StyledTextInput from './StyledTextInput';

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
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <StyledTextInput style={[styles.input, style]} {...props} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

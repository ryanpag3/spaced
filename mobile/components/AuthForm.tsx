import { ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Themed';
import Form from './Form';
import ErrorMessage from './ErrorMessage';
import { Button } from './Themed';

type AuthFormProps = {
  children: ReactNode;
  submitLabel: string;
  onSubmit: () => Promise<void>;
  initialError?: string;
  style?: any;
  isSubmitting?: boolean;
};

export default function AuthForm({
  children,
  submitLabel,
  onSubmit,
  initialError = '',
  style,
  isSubmitting = false,
}: AuthFormProps) {
  const [error, setError] = useState(initialError);

  const handleSubmit = async () => {
    try {
      await onSubmit();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <Form style={style}>
      <View style={styles.fieldsContainer}>
        {children}
      </View>
      
      <Button
        onPress={handleSubmit}
        style={styles.button}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Loading...' : submitLabel}
      </Button>
      
      <ErrorMessage message={error} />
    </Form>
  );
}

const styles = StyleSheet.create({
  fieldsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    marginVertical: 16,
  },
});

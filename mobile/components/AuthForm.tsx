import { ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Themed';
import Form from './Form';
import ErrorMessage from './ErrorMessage';
import { Button } from './Themed';
import { useThemeColor } from './Themed';

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
  const cardBackgroundColor = useThemeColor({}, 'authCardBackground') as string;

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
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {submitLabel === 'Login' ? 'Welcome back' : 'Create account'}
        </Text>
        {submitLabel !== 'Login' && (
          <Text style={styles.subtitle}>
            Sign up to get started with Spaced
          </Text>
        )}
      </View>
      
      <Form style={styles.form}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
    padding: 0,
  },
  fieldsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
});

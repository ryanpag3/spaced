import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/components/useAuth';
import { useRouter } from 'expo-router';
import FormField from '@/components/FormField';
import LinkButton from '@/components/LinkButton';
import AuthForm from '@/components/AuthForm';
import Screen from '@/components/Screen';
import { validateEmail } from '@/utils/validation';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): { isValid: boolean; errorMessage: string } => {
    if (!email || !password) {
      return { isValid: false, errorMessage: 'All fields are required' };
    }

    if (!validateEmail(email)) {
      return { isValid: false, errorMessage: 'Invalid email format' };
    }

    return { isValid: true, errorMessage: '' };
  };

  const onSubmit = async () => {
    const { isValid, errorMessage } = validateForm();
    
    if (!isValid) {
      throw new Error(errorMessage);
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      router.replace("/(app)/(tabs)/home");
    } catch (e) {
      setIsSubmitting(false);
      throw e;
    }
  };

  return (
    <Screen center>
      <AuthForm
        submitLabel="Login"
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      >
        <FormField
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          value={email}
          onChangeText={setEmail}
        />
        <FormField
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
        />
        <LinkButton
          href="/signup"
          style={styles.linkButton}
        >
          Don't have an account? Sign Up
        </LinkButton>
      </AuthForm>
    </Screen>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    marginTop: 16,
  }
});
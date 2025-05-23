import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useAuth } from '@/components/useAuth';
import { useRouter } from 'expo-router';
import { faker } from '@faker-js/faker';
import FormField from '@/components/FormField';
import LinkButton from '@/components/LinkButton';
import AuthForm from '@/components/AuthForm';
import Screen from '@/components/Screen';
import { validateEmail, validatePassword, validatePasswordsMatch, validateUsername } from '@/utils/validation';

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();

  const genPassword = faker.internet.password();
  const [username, setUsername] = useState(faker.internet.username());
  const [email, setEmail] = useState(faker.internet.email());
  const [password, setPassword] = useState(genPassword);
  const [confirmPassword, setConfirmPassword] = useState(genPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): { isValid: boolean; errorMessage: string } => {
    if (!username || !email || !password || !confirmPassword) {
      return { isValid: false, errorMessage: 'All fields are required' };
    }

    if (!validateEmail(email)) {
      return { isValid: false, errorMessage: 'Invalid email format' };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { isValid: false, errorMessage: passwordValidation.message };
    }

    if (!validatePasswordsMatch(password, confirmPassword)) {
      return { isValid: false, errorMessage: 'Passwords do not match' };
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return { isValid: false, errorMessage: usernameValidation.message };
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
      await signUp(username, email, password);
      router.replace("/(app)/(tabs)/home");
    } catch (e) {
      setIsSubmitting(false);
      throw e;
    }
  };

  return (
    <Screen center>
      <AuthForm
        submitLabel="Sign Up"
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      >
        <FormField
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          value={username}
          onChangeText={setUsername}
        />
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
          returnKeyType="next"
        />
        <FormField
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          returnKeyType="done"
        />
        <LinkButton
          href="/login"
          style={styles.linkButton}
        >
          Already have an account? Log In
        </LinkButton>
      </AuthForm>
    </Screen>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    marginTop: 24,
  },
});
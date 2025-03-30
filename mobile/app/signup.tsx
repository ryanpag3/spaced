import StyledTextInput from '@/components/StyledTextInput';
import { Button, View, Text } from '@/components/Themed';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // Simple email regex for basic validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    setError('');
    return true;
  };

  const onSubmit = async () => {
    if (validateForm()) {
      // Handle form submission
      const res = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.status !== 201) {
        setError(data.message || 'An error occurred');
        return;
      }

      await SecureStore.setItemAsync('userToken', data.token);

      Alert.alert('Success', 'Account created successfully!');

      // TODO: Redirect to Home page
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <StyledTextInput
          style={styles.input}
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
        <StyledTextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <StyledTextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Button
          onPress={onSubmit}
          style={{ padding: 10, borderRadius: 5, width: '80%' }}
        >Sign Up</Button>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10
  },
  input: {
    width: '80%',
    padding: 10
  },
  errorText: {
    position: 'absolute',
    bottom: -30,
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  }
})
import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { Text, View, Button } from '@/components/Themed';
import StyledTextInput from '@/components/StyledTextInput';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // Simple email regex for basic validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    if (!email || !password) {
      setError('All fields are required');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return false;
    }

    setError('');
    return true;
  };

  const onSubmit = async () => {
    if (validateForm()) {
      // Handle form submission
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      await SecureStore.setItemAsync('userToken', data.token);

      Alert.alert('Login Successful', 'You have logged in successfully!');
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
        <Button
          onPress={onSubmit}
          style={{ padding: 10, borderRadius: 5, width: '80%' }}
        >Login</Button>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeAreaView>
    )
};

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
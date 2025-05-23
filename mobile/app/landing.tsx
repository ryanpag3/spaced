import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import LinkButton from '@/components/LinkButton';
import Screen from '@/components/Screen';

export default function Landing() {
  return (
    <Screen center>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Spaced</Text>
        <Text style={styles.subtitle}>Connect and share with your friends</Text>
        
        <View style={styles.buttonsContainer}>
          <LinkButton 
            href="/login"
            variant="primary"
            style={styles.button}>
            Login
          </LinkButton>
          <LinkButton 
            href="/signup"
            variant="secondary"
            style={styles.button}>
            Sign Up
          </LinkButton>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  button: {
    width: 200,
  }
});
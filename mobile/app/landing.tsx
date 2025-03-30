import { Button } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Button 
        onPress={() => router.push('/login')}
        style={styles.authButton}>Login</Button>
      <Button 
        onPress={() => router.push('/signup')}
        style={styles.authButton}>Sign Up</Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  authButton: {
    padding: 10,
    borderRadius: 5,
    width: 200
  }
});
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useAuth } from '@/components/useAuth';
import { Button } from '@/components/Themed';
import Screen from '@/components/Screen';

export default function Home() {
  const { signOut } = useAuth();

  return (
    <Screen center>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Home</Text>
        <Text style={styles.subtitle}>You are now logged in</Text>
        <Button 
          onPress={() => signOut()}
          style={styles.button}
          variant="primary"
        >
          Logout
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    width: '80%',
  }
});
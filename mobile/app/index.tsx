import { Button, Text, View } from '@/components/Themed';
import { StyleSheet } from 'react-native';

export default function Root() {
  return (
    <View style={styles.container}>
      <Button style={styles.authButton}>Login</Button>
      <Button style={styles.authButton}>Sign Up</Button>
    </View>
  )
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
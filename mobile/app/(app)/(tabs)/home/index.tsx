import { Button, Text, View } from '@/components/Themed';
import { useAuth } from '@/components/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView>
      <Button
        onPress={() => signOut()}
      >Logout</Button>
    </SafeAreaView>
  )
}
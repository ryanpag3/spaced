import { View, Text, Button } from '@/components/Themed';
import { useAuth } from '@/components/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
    const { signOut } = useAuth();
    return (
        <SafeAreaView>
           <Button onPress={signOut}>Logout</Button> 
        </SafeAreaView>
    )
}
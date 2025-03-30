import { View, Text, Button } from '@/components/Themed';
import { useAuth } from '@/components/useAuth';

export default function Index() {
    const { signOut } = useAuth();
    return (
        <View>
           <Button onPress={signOut}>Logout</Button> 
        </View>
    )
}
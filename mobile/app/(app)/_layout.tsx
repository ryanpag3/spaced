import { Text } from '@/components/Themed';
import { useAuth } from '@/components/useAuth';
import { Redirect, Stack } from 'expo-router';

export default function AppLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Text>Loading</Text>
    };

    if (!isAuthenticated) {
        return <Redirect href="/login" />
    }

    return <Stack
        screenOptions={{
            headerShown: false
        }}
    />
}
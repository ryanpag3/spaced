import { useAuth } from '@/components/useAuth';
import { Redirect, Stack, Tabs } from 'expo-router';
import { Text } from '@/components/Themed';

export default function AuthenticatedLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Text>Loading...</Text>
    }

    if (!isAuthenticated) {
        return <Redirect href="/login"/>
    }

    return (
        <Tabs>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
        </Tabs>
    )
}
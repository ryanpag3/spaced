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
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    display: 'flex',
                },
            }}
        >
            <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
            <Tabs.Screen name="spaces/index" options={{ title: 'Spaces' }} />
            <Tabs.Screen name="submit/index" options={{ title: 'Submit' }} />
        </Tabs>
    )
}
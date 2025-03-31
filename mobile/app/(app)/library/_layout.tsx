import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export default function LibraryLayout() {
  const router = useRouter();
  

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="index" options={{
        title: 'Library',
        headerShown: true
        ,
        headerRight: () => (
          <Pressable onPress={() => router.push('/library/upload.modal')}>
            <Ionicons name="add-circle-outline" size={24} color="black" />
          </Pressable>
        )
      }} />
      <Stack.Screen name="upload.modal" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
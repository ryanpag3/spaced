import { Text } from '@/components/Themed';
import { useAuth } from '@/components/useAuth';
import { AntDesign, Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function AuthenticatedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <Text>Loading...</Text>
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'flex'
        },
      }}
    >
      <Tabs.Screen
        name="home/index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size}) => (
            <AntDesign name="home" size={size} color={color} />
          )
        }} />
      <Tabs.Screen 
        name="spaces/index" 
        options={{ 
          title: 'Spaces',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="workspaces-outline" size={size} color={color} />
          )
        }} />
      <Tabs.Screen 
        name="dummysubmit/index"
        options={{ 
          title: 'Submit',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="plus" size={size} color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props as any}
              onPress={() => {
                router.push("/submit/SelectMediaStep");
              }}
            />
          )
        }} />
      <Tabs.Screen 
        name="search/index" 
        options={{ 
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="search1" size={size} color={color} />
          )
        }} />
      <Tabs.Screen 
        name="profile/index" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          )
        }} />
    </Tabs>
  )
}
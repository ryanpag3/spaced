import { Text, View } from '@/components/Themed';
import PostGrid from '@/components/PostGrid';
import { StyleSheet } from 'react-native';
import { useAuth } from '@/components/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Please log in to view your profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        {user?.username && (
          <Text style={styles.username}>@{user.username}</Text>
        )}
      </View>
      <View style={styles.gridContainer}>
        <PostGrid />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  gridContainer: {
    flex: 1,
  },
});
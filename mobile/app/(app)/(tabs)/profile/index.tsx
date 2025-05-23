import { Text, View } from '@/components/Themed';
import PostGrid from '@/components/PostGrid';
import PostFeed from '@/components/PostFeed';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/components/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Entypo } from '@expo/vector-icons';

export default function Profile() {
  const { isAuthenticated, loading, user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');

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
        <View style={styles.headerLeftSection}>
          <Text style={styles.title}>My Profile</Text>
          {user?.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]} 
            onPress={() => setViewMode('grid')}
          >
            <Entypo name="grid" size={18} color={viewMode === 'grid' ? '#000' : '#999'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'feed' && styles.toggleButtonActive]} 
            onPress={() => setViewMode('feed')}
          >
            <Entypo name="list" size={18} color={viewMode === 'feed' ? '#000' : '#999'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.gridContainer}>
        {viewMode === 'grid' ? <PostGrid /> : <PostFeed />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftSection: {
    flex: 1,
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});
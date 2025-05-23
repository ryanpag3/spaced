import { View, Text } from '@/components/Themed';
import { Post } from '@/components/PostGrid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, TouchableOpacity, View as RNView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AntDesign, Entypo } from '@expo/vector-icons';
import Config from 'react-native-config';
import AuthService from '@/services/AuthService';
import SpacedApi from '@/api/spaced';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function PostScreen() {
  const params = useLocalSearchParams<{ id: string, post: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (params.post) {
          // If post data was passed directly, use it
          setPost(JSON.parse(params.post));
          setLoading(false);
          return;
        }
        
        // Otherwise load the post by ID
        if (!params.id) {
          throw new Error('Post ID is required');
        }
        
        // Here we would typically fetch a single post by ID
        // For now, we'll show an error, but in a real app you would
        // implement an API call to get a single post
        setError('Post data not provided');
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [params.id, params.post]);

  const getMediaUris = (post: Post): string[] => {
    const uris: string[] = [];
    
    // Add media from media objects
    if (post.media && Array.isArray(post.media) && post.media.length > 0) {
      post.media.forEach(mediaItem => {
        if (mediaItem && mediaItem.s3Key) {
          uris.push(`${Config.API_URL}/media/${mediaItem.s3Key}`);
        }
      });
    }
    
    // Add media from mediaUris array if no media objects or if they're empty
    if ((uris.length === 0) && post.mediaUris && Array.isArray(post.mediaUris) && post.mediaUris.length > 0) {
      post.mediaUris.forEach(uri => {
        uris.push(`${Config.API_URL}/${uri}`);
      });
    }
    
    return uris;
  };
  
  const handleMediaScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentMediaIndex(index);
  };
  
  const renderMediaItem = ({ item: uri }: { item: string }) => {
    return (
      <Image 
        source={{ uri }} 
        style={styles.postImage} 
        contentFit="cover"
        transition={500}
        cachePolicy="memory-disk"
        placeholderContentFit="cover"
      />
    );
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return '';
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }
  
  if (error || !post) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const mediaUris = getMediaUris(post);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with back button and menu */}
      <RNView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Post</Text>
        
        <TouchableOpacity style={styles.menuButton}>
          <Entypo name="dots-three-vertical" size={20} color="black" />
        </TouchableOpacity>
      </RNView>
      
      <View style={styles.content}>
        {/* Media carousel */}
        {mediaUris.length > 0 ? (
          <RNView style={styles.mediaContainer}>
            <FlatList
              data={mediaUris}
              renderItem={renderMediaItem}
              keyExtractor={(uri, index) => `media-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMediaScroll}
            />
            {mediaUris.length > 1 && (
              <RNView style={styles.paginationContainer}>
                {mediaUris.map((_, index) => (
                  <RNView
                    key={`dot-${index}`}
                    style={[
                      styles.paginationDot,
                      currentMediaIndex === index && styles.paginationDotActive
                    ]}
                  />
                ))}
              </RNView>
            )}
          </RNView>
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        
        {/* Post details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          
          {post.description && (
            <Text style={styles.description}>{post.description}</Text>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  postImage: {
    width: screenWidth,
    height: 300,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  noImagePlaceholder: {
    width: '100%', 
    height: 300,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#666',
    fontSize: 14,
  },
  detailsContainer: {
    padding: 16,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

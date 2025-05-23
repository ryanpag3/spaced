import { Image } from 'expo-image';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View as RNView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Text, View } from './Themed';
import AuthService from '@/services/AuthService';
import SpacedApi from '@/api/spaced';
import Config from 'react-native-config';
import { Post, PostsResponse } from './PostGrid';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (refresh = false) => {
    if ((!hasMore && !refresh) || (loading && !refresh)) {
      return;
    }
    
    if (refresh) {
      setRefreshing(true);
      setNextPageToken(undefined);
      setHasMore(true);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }
    
    try {
      const response = await AuthService.withToken(token => {
        const pageToken = refresh ? undefined : nextPageToken;
        return SpacedApi.getPosts(token, 'profile', 10, pageToken);
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      let data: PostsResponse;
      try {
        data = JSON.parse(responseText) as PostsResponse;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      if (!data || !Array.isArray(data.posts)) {
        console.error('Invalid data format:', data);
        throw new Error('Received invalid data format from server');
      }
      
      const processedPosts = data.posts.map(post => {
        if (!post.media || !Array.isArray(post.media)) {
          post.media = [];
        }
        return post;
      });
      
      setPosts(refresh ? processedPosts : [...posts, ...processedPosts]);
      setNextPageToken(data.nextPageToken);
      setHasMore(!!data.nextPageToken);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadInitialPosts = async () => {
      try {
        await fetchPosts(true);
      } catch (err) {
        console.error('Error loading initial posts:', err);
      }
    };
    
    loadInitialPosts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Track current media index for each post
  const [mediaIndices, setMediaIndices] = useState<{[postId: string]: number}>({});

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return '';
    }
  };
  
  // Helper to get all media URIs for a post
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

  // Handle scroll events to update the current index
  const handleMediaScroll = (postId: string) => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setMediaIndices(prev => ({
      ...prev,
      [postId]: index
    }));
  };
  
  // Render a single media item
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
    
  const renderItem = ({ item }: { item: Post }) => {
    const mediaUris = getMediaUris(item);
    const currentMediaIndex = mediaIndices[item.id] || 0;
    
    return (
      <View style={styles.postCard}>
        {mediaUris.length > 0 ? (
          <RNView style={styles.mediaContainer}>
            <FlatList
              data={mediaUris}
              renderItem={renderMediaItem}
              keyExtractor={(uri, index) => `${item.id}-media-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMediaScroll(item.id)}
            />
            {mediaUris.length > 1 && (
              <RNView style={styles.paginationContainer}>
                {mediaUris.map((_, index) => (
                  <RNView
                    key={`${item.id}-dot-${index}`}
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
        
        <View style={styles.postContent}>
          <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
          {item.description && (
            <Text style={styles.postDescription}>{item.description}</Text>
          )}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (error && !loading && !refreshing) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchPosts(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (posts.length === 0 && !error && !loading && !refreshing) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchPosts(true)}
        >
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={posts || []}
      keyExtractor={(item, index) => item?.id || `post-${index}`}
      renderItem={renderItem}
      onEndReached={() => fetchPosts(false)}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchPosts(true)}
          tintColor="#666"
          title="Refreshing posts..."
        />
      }
      ListFooterComponent={loading && !refreshing ? <ActivityIndicator style={styles.loader} /> : null}
      ListEmptyComponent={
        loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#666" />
            <Text style={{marginTop: 10}}>Loading posts...</Text>
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    flex: 1,
  },
  postCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  postContent: {
    padding: 16,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  postDescription: {
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
  noImagePlaceholder: {
    width: '100%', 
    height: 200,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#666',
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loader: {
    padding: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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

import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View, useTheme } from './Themed';
import { useThemedStyles } from './useThemedStyles';
import AuthService from '@/services/AuthService';
import SpacedApi from '@/api/spaced';
import Config from 'react-native-config';
import { useRouter } from 'expo-router';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const tileSize = screenWidth / numColumns;

export interface Media {
  id: string;
  s3Key: string;
  mimeType: string;
  postId?: string;
}

export interface Post {
  id: string;
  description: string;
  tags: string[];
  createdAt: string;
  authorId?: string;
  media?: Media[];
  mediaUris?: string[];
}

export interface PostsResponse {
  posts: Post[];
  nextPageToken?: string;
  total: number;
}

export default function PostGrid() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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
      // Don't clear posts immediately to prevent flashing
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
        return SpacedApi.getPosts(token, 'profile', 20, pageToken);
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      let data: PostsResponse;
      try {
        data = JSON.parse(responseText) as PostsResponse;

        console.log(JSON.stringify(data, null, 4));
        
        if (data?.posts?.length > 0) {
          const firstPost = data.posts[0];
          console.log('First post details:', {
            id: firstPost.id,
            hasMedia: !!firstPost.media,
            mediaCount: firstPost.media?.length || 0,
            mediaDetails: firstPost.media?.map(m => ({ id: m.id, s3Key: m.s3Key })),
            hasMediaUris: !!firstPost.mediaUris,
            mediaUrisCount: firstPost.mediaUris?.length || 0,
            mediaUrisExample: firstPost.mediaUris?.[0]
          });
        } else {
          console.log('No posts returned from API');
        }
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
        
        if ((!post.media || post.media.length === 0) && 
            post.mediaUris && Array.isArray(post.mediaUris) && post.mediaUris.length > 0) {
          console.log('Post has mediaUris but no media objects:', post.id);
        }
        
        return post;
      });
      
      // Only update posts once we have the new data
      setPosts(refresh ? processedPosts : [...posts, ...processedPosts]);
      console.log(`Posts updated: ${refresh ? 'refreshed' : 'appended'}, total: ${refresh ? processedPosts.length : posts.length + processedPosts.length}`);
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

  const renderItem = ({ item }: { item: Post }) => {
    const navigateToPost = () => {
      router.push({
        pathname: "/(app)/post/[id]",
        params: {
          id: item.id,
          post: JSON.stringify(item)
        }
      });
    };
    
    if (item.media && Array.isArray(item.media) && item.media.length > 0) {
      const firstMedia = item.media[0];
      
      if (firstMedia && firstMedia.s3Key) {
        const imageUri = `${Config.API_URL}/media/${firstMedia.s3Key}`;
        return (
          <TouchableOpacity 
            style={styles.tile} 
            activeOpacity={0.8}
            onPress={navigateToPost}
          >
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image} 
              contentFit="cover"
              transition={500}
              cachePolicy="memory-disk"
              placeholderContentFit="cover"
            />
          </TouchableOpacity>
        );
      }
    }
    
    if (item.mediaUris && Array.isArray(item.mediaUris) && item.mediaUris.length > 0) {
      const firstMediaUri = item.mediaUris[0];
      const imageUri = `${Config.API_URL}/${firstMediaUri}`;
      return (
        <TouchableOpacity 
          style={styles.tile} 
          activeOpacity={0.8}
          onPress={navigateToPost}
        >
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            contentFit="cover"
            transition={500}
            cachePolicy="memory-disk"
            placeholderContentFit="cover"
          />
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity 
        style={styles.tile} 
        activeOpacity={0.8}
        onPress={navigateToPost}
      >
        <View style={[styles.image, styles.noImagePlaceholder]}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      </TouchableOpacity>
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
      numColumns={numColumns}
      onEndReached={() => fetchPosts(false)}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchPosts(true)}
          tintColor={colors.activityIndicator}
          title="Refreshing posts..."
        />
      }
      ListFooterComponent={loading && !refreshing ? <ActivityIndicator style={styles.loader} color={colors.activityIndicator} /> : null}
      ListEmptyComponent={
        loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.activityIndicator} />
            <Text style={{marginTop: 10}}>Loading posts...</Text>
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  list: {
    width: '100%',
    flex: 1,
  },
  tile: {
    width: tileSize,
    height: tileSize,
    margin: 1,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  noImageText: {
    color: colors.textSecondary,
    fontSize: 12,
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
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
});

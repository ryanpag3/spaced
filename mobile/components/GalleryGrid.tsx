import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';
import { MaterialIcons } from '@expo/vector-icons';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const tileSize = screenWidth / numColumns;

export default function GalleryGrid({
  onSelectedAssetsChanged
}: { onSelectedAssetsChanged: (assets: MediaLibrary.Asset[]) => void }) {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<{[id: string]: MediaLibrary.Asset}>({});

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;
      setHasPermission(true);
      await loadMore();
    })()
  }, []);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    const page = await MediaLibrary.getAssetsAsync({
      first: 60,
      after: endCursor ?? undefined,
      mediaType: ['photo', 'video'],
      sortBy: [MediaLibrary.SortBy.creationTime]
    });

    setAssets((prev) => [...prev, ...page.assets]);
    setEndCursor(page.endCursor);
    setHasMore(page.hasNextPage);
    setLoading(false);
  }

  const toggleSelect = async (asset: MediaLibrary.Asset) => {
    if (selected[asset.id]) {
      delete selected[asset.id];
    } else {
      // Get detailed asset info only when selected
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      selected[asset.id] = assetInfo;
    }
    setSelected({...selected});
    onSelectedAssetsChanged(Object.values(selected));
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isSelected = selected[item.id] !== undefined;
    return (
      <TouchableOpacity
        style={styles.tile}
        activeOpacity={0.8}
        onPress={() => toggleSelect(item)}
      >
        <Image source={{ uri: item.uri }} style={styles.image} />

        {/* Video play icon */}
        {item.mediaType === 'video' && (
          <MaterialIcons
            name="play-circle-outline"
            size={28}
            color="white"
            style={styles.playIcon}
          />
        )}

        {/* Selection overlay */}
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <MaterialIcons
              name="check-circle"
              size={32}
              color="white"
            />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  if (!hasPermission) {
    return (
      <View>
        <Text>Need permission to access media library.</Text>
      </View>
    )
  }

  return (
    <FlatList
      style={styles.list}
      data={assets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={numColumns}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    height: '100%'
  },
  tile: {
    width: tileSize,
    height: tileSize,
    margin: 1,
    backgroundColor: '#000'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  playIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    opacity: 0.8,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
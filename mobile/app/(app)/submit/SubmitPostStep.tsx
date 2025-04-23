import { Asset } from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, FlatList, KeyboardAvoidingView, Text, TextInput, View, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Image } from 'expo-image';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SubmitPostStep() {
  const params = useLocalSearchParams<{ selectedIds: string }>();
  const selectedIds = JSON.parse(params.selectedIds ?? "[]");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<Asset>>(null);

  useEffect(() => {
    if(selectedIds.length === 0) {
      setAssets([]);
      return;
    }

    // query for assets
    (async () => {
      try {
        let fetchedAssets = [];
        for (const id of selectedIds) {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(id);
          fetchedAssets.push(assetInfo);
        }
        setAssets(fetchedAssets);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedIds]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={listRef}
          data={assets}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item}) => (
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
            />
          )}
        />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Add a description..."
        />
        <Text style={[styles.label, { marginTop: 16 }]}>Tags</Text>
        <TextInput
          style={styles.input}
          placeholder="Add tags, separated by commas"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  carouselContainer: { height: SCREEN_WIDTH },
  image: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  indicatorContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ccc', marginHorizontal: 4,
  },
  dotActive: { backgroundColor: '#333' },
  form: { flex: 1, padding: 16 },
  label: { fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, minHeight: 44, textAlignVertical: 'top',
  },
});
import SpacedApi from '@/api/spaced';
import Auth from '@/lib/auth';
import { Image } from 'expo-image';
import { Asset } from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, Dimensions, FlatList, KeyboardAvoidingView, NativeScrollEvent, NativeSyntheticEvent, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useThemedStyles } from '@/components/useThemedStyles';
import { useTheme } from '@/components/ThemeProvider';
import { ColorTheme } from '@/constants/Colors';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SubmitPostStep() {
  const router = useRouter();
  const params = useLocalSearchParams<{ selectedAssets: string }>();
  const selectedAssets = JSON.parse(params.selectedAssets ?? "[]") as Asset[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [description, setDescription] = useState<string | undefined>();
  const [tags, setTags] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const listRef = useRef<FlatList<Asset>>(null);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();
      
      const token = await Auth.getToken();
      const tagsArr = tags?.split(',') ?? [];
      const formData = new FormData();
      if (description) {
        formData.append('description', description);
      }

      if (tagsArr.length > 0) {
        for (const tag of tagsArr) {
          formData.append('tags[]', tag);
        }
      }

      selectedAssets.forEach((asset, index) => {
        if (asset.uri && asset.mediaType && asset.filename) {
          formData.append('media', {
            uri: (asset as any).localUri,
            name: asset.filename,
            type: asset.mediaType
          } as any);
        }
      });

      const result = await SpacedApi.createPost(token as string, formData);
      
      // Add artificial delay if operation was too fast
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
      }
      
      setIsSuccess(true);
      
      // Navigate home after showing success for a moment
      setTimeout(() => {
        router.replace("/(app)/(tabs)/home");
      }, 1500);
    } catch (e) {
      // Error handling remains but without logging
      setIsLoading(false);
    }
  }

  if (isLoading || isSuccess) {
    return (
      <View style={[styles.container, styles.center]}>
        {isLoading && !isSuccess && (
          <>
            <ActivityIndicator size="large" color="#2f95dc" />
            <Text style={styles.statusText}>Uploading your post...</Text>
          </>
        )}
        {isSuccess && (
          <>
            <AntDesign name="checkcircle" size={64} color="#2ecc71" />
            <Text style={styles.statusText}>Post successfully created!</Text>
          </>
        )}
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
          data={selectedAssets}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
            />
          )}
        />

        {/* Dot Indicator */}
        <View style={styles.indicatorContainer}>
          {selectedAssets.map((_: any, idx: any) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={(text) => setDescription(text)}
          style={styles.input}
          placeholder="Add a description..."
        />
        <Text style={[styles.label, { marginTop: 16 }]}>Tags</Text>
        <TextInput
          value={tags}
          onChangeText={(text) => setTags(text)}
          style={styles.input}
          placeholder="Add tags, separated by commas"
        />

        <View style={styles.submitButtonContainer}>
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
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
    backgroundColor: '#333', marginHorizontal: 4,
  },
  dotActive: { backgroundColor: '#ccc' },
  form: { flex: 1, padding: 16 },
  label: { fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, minHeight: 44, textAlignVertical: 'top',
  },
  submitButtonContainer: {
    marginTop: 24,
  },
  statusText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  }
});
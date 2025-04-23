import { Asset } from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, FlatList, KeyboardAvoidingView, Text, TextInput, View, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Platform, Button } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Image } from 'expo-image';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SubmitPostStep() {
  const params = useLocalSearchParams<{ selectedAssets: string }>();
  const selectedAssets = JSON.parse(params.selectedAssets ?? "[]");
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<Asset>>(null);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
  };

  const handleSubmit = () => {
    // do something
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
          renderItem={({ item}) => (
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
          style={styles.input}
          placeholder="Add a description..."
        />
        <Text style={[styles.label, { marginTop: 16 }]}>Tags</Text>
        <TextInput
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
});
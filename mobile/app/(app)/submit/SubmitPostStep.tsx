import SpacedApi from '@/api/spaced';
import Auth from '@/lib/auth';
import { Image } from 'expo-image';
import { Asset } from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator, 
  Dimensions, 
  FlatList, 
  KeyboardAvoidingView, 
  NativeScrollEvent, 
  NativeSyntheticEvent, 
  Platform, 
  ScrollView,
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useThemedStyles } from '@/components/useThemedStyles';
import { useTheme } from '@/components/ThemeProvider';
import { ColorTheme } from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import StyledTextInput from '@/components/StyledTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
interface Space {
  id: string;
  name: string;
  description?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const createStyles = (colors: ColorTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: { 
    flex: 1,
    backgroundColor: colors.background,
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 16 
  },
  carouselContainer: { 
    height: SCREEN_WIDTH,
    backgroundColor: colors.backgroundTertiary,
    position: 'relative'
  },
  image: { 
    width: SCREEN_WIDTH, 
    height: SCREEN_WIDTH 
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8, 
    height: 8, 
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    marginHorizontal: 4,
  },
  dotActive: { 
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
  videoIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: { 
    flex: 1, 
    padding: 24,
  },
  label: { 
    fontSize: 16,
    fontWeight: '600', 
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    minHeight: 48,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    minHeight: 56,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadowOpacity,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: colors.textTertiary,
  },
  statusText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownHeader: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownHeaderText: {
    fontWeight: '600',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  activeDropdownItem: {
    backgroundColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  scrollContent: {
    paddingBottom: 100,
  }
});

export default function SubmitPostStep() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{ selectedAssets: string }>();
  const selectedAssets = JSON.parse(params.selectedAssets ?? "[]") as Asset[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const listRef = useRef<FlatList<Asset>>(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setIsLoadingSpaces(true);
        const token = await Auth.getToken();
        if (!token) return;
        
        const response = await SpacedApi.getSpaces(token);
        if (!response.ok) {
          throw new Error('Failed to fetch spaces');
        }
        
        const spacesData = await response.json();
        setSpaces(spacesData);
      } catch (error) {
        console.error('Error fetching spaces:', error);
      } finally {
        setIsLoadingSpaces(false);
      }
    };

    fetchSpaces();
  }, []);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const startTime = Date.now();
      
      const token = await Auth.getToken();
      const tagsArr = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const formData = new FormData();
      
      if (description) {
        formData.append('description', description);
      }

      if (tagsArr.length > 0) {
        for (const tag of tagsArr) {
          formData.append('tags[]', tag);
        }
      }

      if (selectedSpace) {
        formData.append('spaceId', selectedSpace.id);
      }

      selectedAssets.forEach((asset) => {
        if (asset.uri && asset.mediaType && asset.filename) {
          formData.append('media', {
            uri: (asset as any).localUri,
            name: asset.filename,
            type: asset.mediaType
          } as any);
        }
      });

      await SpacedApi.createPost(token as string, formData);
      
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        router.replace("/(app)/(tabs)/home");
      }, 1500);
    } catch (e) {
      setIsLoading(false);
    }
  }

  const toggleDropdown = () => {
    setIsDropdownVisible(prev => !prev);
  };

  const handleSpaceSelect = (space: Space) => {
    setSelectedSpace(space);
    setIsDropdownVisible(false);
  };

  if (isLoading || isSuccess) {
    return (
      <View style={[styles.container, styles.center]}>
        {isLoading && !isSuccess && (
          <>
            <ActivityIndicator size="large" color={colors.activityIndicator} />
            <Text style={styles.statusText}>Uploading your post...</Text>
          </>
        )}
        {isSuccess && (
          <>
            <AntDesign name="checkcircle" size={64} color={colors.success} />
            <Text style={styles.statusText}>Post successfully created!</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
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
                contentFit="cover"
              />
            )}
          />

          {selectedAssets[currentIndex]?.mediaType === 'video' && (
            <View style={styles.videoIndicator}>
              <MaterialIcons name="videocam" size={24} color="white" />
            </View>
          )}

          {selectedAssets.length > 1 && (
            <View style={styles.indicatorContainer}>
              {selectedAssets.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Description</Text>
          <StyledTextInput
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            placeholder="Add a description..."
            multiline
            numberOfLines={3}
          />
          
          <Text style={styles.label}>Tags</Text>
          <StyledTextInput
            value={tags}
            onChangeText={setTags}
            style={styles.input}
            placeholder="Add tags, separated by commas"
          />

          <Text style={styles.label}>Space (optional)</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownHeader}
              onPress={toggleDropdown}
            >
              <Text style={styles.dropdownHeaderText}>
                {isLoadingSpaces 
                  ? 'Loading spaces...' 
                  : spaces.length === 0 
                    ? 'No spaces available' 
                    : selectedSpace 
                      ? selectedSpace.name 
                      : 'Select a space (optional)'}
              </Text>
              <MaterialIcons 
                name={isDropdownVisible ? "arrow-drop-up" : "arrow-drop-down"} 
                size={24} 
                color="#333" 
              />
            </TouchableOpacity>

            {isDropdownVisible && spaces.length > 0 && (
              <ScrollView style={styles.dropdownList}>
                {spaces.map((space) => (
                  <TouchableOpacity
                    key={space.id}
                    style={[
                      styles.dropdownItem,
                      selectedSpace?.id === space.id && styles.activeDropdownItem
                    ]}
                    onPress={() => handleSpaceSelect(space)}
                  >
                    <Text style={styles.dropdownItemText}>{space.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!description && !tags) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!description && !tags}
          >
            <Text style={[
              styles.submitButtonText, 
              (!description && !tags) && styles.submitButtonTextDisabled
            ]}>
              Submit Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  },
  dropdownContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownHeader: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  dropdownHeaderText: {
    fontWeight: '600',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  dropdownItemText: {
    fontSize: 16,
  },

});
import GalleryGrid from '@/components/GalleryGrid';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Asset } from 'expo-media-library';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useTheme } from '@/components/ThemeProvider';
import { useThemedStyles } from '@/components/useThemedStyles';
import { ColorTheme } from '@/constants/Colors';

export default function SelectMediaStep() {
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const onNextPushed = useCallback(async () => {
    if (selectedAssets.length === 0) {
      Alert.alert("You must select at least one photo or video.");
      return;
    }

    if (isNavigating) return; // Prevent multiple clicks
    setIsNavigating(true);

    try {
      // Process assets silently in the background
      // We'll just pass the assets as is
      router.push({
        pathname: "/submit/SubmitPostStep",
        params: {
          selectedAssets: JSON.stringify(selectedAssets)
        }
      });
    } catch (error) {
      console.error("Error navigating:", error);
      Alert.alert("Error", "Failed to proceed to the next step. Please try again.");
      setIsNavigating(false);
    }
  }, [selectedAssets, router, isNavigating]);

  useLayoutEffect(() => {
    navigation.setOptions({
      animation: 'slide_from_left',
      animationMatchesGesture: true,
      headerShown: true,
      headerBackTitle: 'Back',
      title: 'Select Media',
      headerRight: () => (
        <TouchableOpacity 
          style={[
            { 
              paddingVertical: 8, 
              paddingHorizontal: 12,
              borderRadius: 8,
              opacity: isNavigating || selectedAssets.length === 0 ? 0.5 : 1
            },
          ]}
          onPress={onNextPushed}
          disabled={isNavigating || selectedAssets.length === 0}
        >
          <Text 
            style={{ 
              color: colors.tint, 
              fontWeight: '600', 
              fontSize: 16 
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      )
    } satisfies NativeStackNavigationOptions);
  }, [navigation, onNextPushed, isNavigating, selectedAssets.length, colors]);

  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <GalleryGrid 
        onSelectedAssetsChanged={(selected) => setSelectedAssets([...selected])} 
      />
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          {selectedAssets.length} {selectedAssets.length === 1 ? 'item' : 'items'} selected
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  selectionInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  selectionText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  }
});
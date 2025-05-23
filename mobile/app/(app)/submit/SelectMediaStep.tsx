import GalleryGrid from '@/components/GalleryGrid';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Asset } from 'expo-media-library';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

export default function SelectMediaStep() {
  const navigation = useNavigation();
  const router = useRouter();
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
        <Button 
          title="Next" 
          onPress={onNextPushed} 
          disabled={isNavigating || selectedAssets.length === 0}
        />
      )
    } satisfies NativeStackNavigationOptions);
  }, [navigation, onNextPushed, isNavigating, selectedAssets.length]);

  return (
    <View style={styles.container}>
      <GalleryGrid 
        onSelectedAssetsChanged={(selected) => setSelectedAssets([...selected])} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
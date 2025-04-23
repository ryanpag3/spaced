import GalleryGrid from '@/components/GalleryGrid';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Asset } from 'expo-media-library';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, Button, View } from 'react-native';

export default function SelectMediaStep() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  const onNextPushed = useCallback(() => {
    if (selectedAssets.length === 0) {
      Alert.alert("You must select at least one photo or video.");
      return;
    }
    router.push({
      pathname: "/submit/SubmitPostStep",
      params: {
        selectedAssets: JSON.stringify([...selectedAssets])
      }
    })
  }, [selectedAssets, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      animation: 'slide_from_left',
      animationMatchesGesture: true,
      headerShown: true,
      headerBackTitle: 'Back',
      title: 'Select Media',
      headerRight: () => (
        <Button title="Next" onPress={onNextPushed} />
      )
    } satisfies NativeStackNavigationOptions);
  }, [navigation, onNextPushed]);

  return (
    <View>
      <GalleryGrid onSelectedAssetsChanged={(selected) => setSelectedAssets([...selected])} />
    </View>
  )
}
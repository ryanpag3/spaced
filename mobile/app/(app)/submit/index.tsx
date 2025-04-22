import GalleryGrid from '@/components/GalleryGrid';
import { Text } from '@/components/Themed';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Submit() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      animation: 'slide_from_left',
      animationMatchesGesture: true
    });
  }, [navigation]);

  return (
    <SafeAreaView>
      <GalleryGrid/>
    </SafeAreaView>
  )
}
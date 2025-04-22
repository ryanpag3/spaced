import GalleryGrid from '@/components/GalleryGrid';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Button, View } from 'react-native';

export default function SelectMediaStep() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      animation: 'slide_from_left',
      animationMatchesGesture: true,
      headerShown: true,
      headerBackTitle: 'Back',
      title: 'Select Media',
      headerRight: () => (
        <Button title="Next"/>
      )
  } satisfies NativeStackNavigationOptions);
  }, [navigation]);

  return (
    <View>
      <GalleryGrid/>
    </View>
  )
}
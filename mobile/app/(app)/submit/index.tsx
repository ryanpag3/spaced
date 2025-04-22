import GalleryGrid from '@/components/GalleryGrid';
import { Text } from '@/components/Themed';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { Button, View } from 'react-native';

export default function Submit() {
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
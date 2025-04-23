import GalleryGrid from '@/components/GalleryGrid';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Button, View } from 'react-native';

export default function SelectMediaStep() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const onNextPushed = useCallback(() => {
    console.log(selectedIds);
    if (selectedIds.length === 0) {
      Alert.alert("You must select at least one photo or video.");
      return;
    }
    router.push({
      pathname: "/submit/SubmitPostStep",
      params: {
        selectedIds: JSON.stringify([...selectedIds])
      }
    })
  }, [selectedIds, router]);

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
      <GalleryGrid onSelectedIdsChanged={(selectedIds) => setSelectedIds([...selectedIds])} />
    </View>
  )
}
import { useSelectedAlbums } from '@/components/useSelectedAlbums';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function Library() {
    const { selectedAlbumIds } = useSelectedAlbums();
    const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);

    useEffect(() => {
        const loadPhotos = async () => {
            if (selectedAlbumIds.length === 0) return;

            const photosPromises = selectedAlbumIds.map(albumId =>
                MediaLibrary.getAssetsAsync({
                    album: albumId,
                    mediaType: 'photo',
                    sortBy: ['creationTime'],
                })
            );

            const results = await Promise.all(photosPromises);
            
            const allPhotos = results.flatMap(result => result.assets);
            const uniquePhotos = [...new Map(allPhotos.map(photo => [photo.id, photo])).values()];
            
            setPhotos(uniquePhotos);
        };

        loadPhotos();
    }, [selectedAlbumIds]);

    const renderPhoto = ({ item }: { item: MediaLibrary.Asset }) => (
        <Image
            source={{ uri: item.uri }}
            style={styles.photo}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={photos}
                renderItem={renderPhoto}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={styles.photoList}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    photoList: {
        padding: 4,
    },
    photo: {
        width: '33%',
        aspectRatio: 1,
        margin: 1,
    },
});
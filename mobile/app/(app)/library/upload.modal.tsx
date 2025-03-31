import { View, Text } from '@/components/Themed';
import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useSelectedAlbums } from '@/components/useSelectedAlbums';
import { useRouter } from 'expo-router';

export default function UploadModal() {
    const router = useRouter();
    const { setSelectedAlbumIds } = useSelectedAlbums();
    const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
    const [selectedAlbums, setSelectedAlbums] = useState<Set<string>>(new Set());

    useEffect(() => {
        (async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') return;
            const albums = await MediaLibrary.getAlbumsAsync({
                includeSmartAlbums: true,
            });
            setAlbums(albums);
        })();
    }, []);

    const toggleAlbum = (albumId: string) => {
        setSelectedAlbums(prev => {
            const newSet = new Set(prev);
            if (newSet.has(albumId)) {
                newSet.delete(albumId);
            } else {
                newSet.add(albumId);
            }
            return newSet;
        });
    };

    const handleConfirm = () => {
        const selectedAlbumObjects = albums.filter(album => 
            selectedAlbums.has(album.id)
        );
        const selectedAlbumIds = selectedAlbumObjects.map(album => album.id);
        setSelectedAlbumIds(selectedAlbumIds);
        router.back();
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={albums}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.albumItem}
                        onPress={() => toggleAlbum(item.id)}
                    >
                        <Checkbox
                            value={selectedAlbums.has(item.id)}
                            onValueChange={() => toggleAlbum(item.id)}
                            style={styles.checkbox}
                        />
                        <View style={styles.textContainer}>
                            <Text>{item.title}</Text>
                            <Text style={styles.countText}>{item.assetCount} photos</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
            {selectedAlbums.size > 0 && (
                <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmButtonText}>
                        Confirm ({selectedAlbums.size} selected)
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    albumItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    checkbox: {
        marginRight: 12,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    countText: {
        color: '#666',
    },
    confirmButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

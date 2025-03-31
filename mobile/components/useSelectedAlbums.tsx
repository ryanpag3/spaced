import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@selected_albums';

type SelectedAlbumsContextType = {
    selectedAlbumIds: string[];
    setSelectedAlbumIds: React.Dispatch<React.SetStateAction<string[]>>;
    clearSelectedAlbums: () => void;
    isAlbumSelected: (id: string) => boolean;
};

const SelectedAlbumsContext = createContext<SelectedAlbumsContextType | undefined>(undefined);

export function SelectedAlbumsProvider({ children }: { children: React.ReactNode }) {
    const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);

    // Load saved albums from storage when component mounts
    useEffect(() => {
        const loadSelectedAlbums = async () => {
            try {
                const savedAlbums = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedAlbums) {
                    setSelectedAlbumIds(JSON.parse(savedAlbums));
                }
            } catch (error) {
                console.error('Error loading selected albums:', error);
            }
        };
        loadSelectedAlbums();
    }, []);

    // Save to storage whenever selectedAlbumIds changes
    useEffect(() => {
        const saveSelectedAlbums = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedAlbumIds));
            } catch (error) {
                console.error('Error saving selected albums:', error);
            }
        };
        saveSelectedAlbums();
    }, [selectedAlbumIds]);

    const clearSelectedAlbums = () => {
        setSelectedAlbumIds([]);
    };

    const isAlbumSelected = (id: string) => {
        return selectedAlbumIds.includes(id);
    };

    return (
        <SelectedAlbumsContext.Provider
            value={{
                selectedAlbumIds,
                setSelectedAlbumIds,
                clearSelectedAlbums,
                isAlbumSelected,
            }}
        >
            {children}
        </SelectedAlbumsContext.Provider>
    );
}

export function useSelectedAlbums() {
    const context = useContext(SelectedAlbumsContext);
    if (context === undefined) {
        throw new Error('useSelectedAlbums must be used within a SelectedAlbumsProvider');
    }
    return context;
}
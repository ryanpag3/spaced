import { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  FlatList, 
  RefreshControl, 
  Animated, 
  Dimensions,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import { Text, View, Button, TextInput, useTheme } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { useThemedStyles } from '@/components/useThemedStyles';
import { ColorTheme } from '@/constants/Colors';
import SpacedApi from '@/api/spaced';
import AuthService from '@/services/AuthService';
import { useAuth } from '@/components/useAuth';

// Interface for Space data
interface Space {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export default function Spaces() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // Animation functions
  const showModal = () => {
    setIsModalVisible(true);
    // Reset the position of the modal before animation starts
    slideAnim.setValue(Dimensions.get('window').height);
    fadeAnim.setValue(0);
    
    // Run animations in sequence for more fluid effect
    Animated.parallel([
      // Fade in overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      // Slide up the modal with spring for bouncy effect
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 12,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const hideModal = () => {
    // Animate out in parallel - slide down and fade out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsModalVisible(false);
      setSpaceName('');
      setSpaceDescription('');
    });
  };
  
  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isModalVisible) {
        hideModal();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [isModalVisible]);

  const fetchSpaces = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const token = await AuthService.getToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await SpacedApi.getSpaces(token);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch spaces: ${response.status}`);
      }
      
      const data = await response.json();
      setSpaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
      console.error('Error fetching spaces:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSpaces();
    }
  }, [isAuthenticated]);

  const handleCreateSpace = async () => {
    if (!spaceName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = await AuthService.getToken();
      if (!token) throw new Error('Authentication required');
      
      const spaceData = { 
        name: spaceName.trim(),
        ...(spaceDescription.trim() !== '' && { description: spaceDescription.trim() })
      };
      
      const response = await SpacedApi.createSpace(token, spaceData);
      
      if (!response.ok) {
        throw new Error(`Failed to create space: ${response.status}`);
      }
      
      // Close modal with animation
      hideModal();
      
      // Refresh spaces list
      fetchSpaces();
    } catch (err) {
      console.error('Error creating space:', err);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Space }) => (
    <TouchableOpacity style={styles.spaceItem} activeOpacity={0.7}>
      <Text style={styles.spaceName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.spaceDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header with title and create button */}
      <View style={styles.header}>
        <Text style={styles.title}>Spaces</Text>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={showModal}
        >
          <AntDesign name="plus" size={20} color={colors.text} />
          <Text style={styles.createButtonText}>Create Space</Text>
        </TouchableOpacity>
      </View>
      
      {/* Spaces list */}
      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.activityIndicator} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={() => fetchSpaces()} style={styles.retryButton}>Retry</Button>
        </View>
      ) : spaces.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No spaces found</Text>
          <Text style={styles.emptySubtext}>Create a new space to get started</Text>
        </View>
      ) : (
        <FlatList
          data={spaces}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSpaces(true)}
              tintColor={colors.activityIndicator}
            />
          }
        />
      )}
      
      {/* Create Space Bottom Sheet Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={hideModal}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={hideModal}>
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.bottomSheetContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Handle bar indicator */}
          <View style={styles.handleBar} />
          
          <Text style={styles.modalTitle}>Create New Space</Text>
          <Text style={styles.modalDescription}>
            Spaces are private areas where you can share your photos & videos with only those who you allow.
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={spaceName}
              onChangeText={setSpaceName}
              placeholder="Enter space name"
              autoFocus
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={spaceDescription}
              onChangeText={setSpaceDescription}
              placeholder="Enter space description"
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              onPress={hideModal}
              variant="outline"
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleCreateSpace}
              disabled={!spaceName.trim() || isSubmitting}
              style={styles.modalButton}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.text,
    fontWeight: '500',
    marginLeft: 6,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  spaceItem: {
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  spaceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 16,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'left',
    color: colors.text,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    width: '100%',
    backgroundColor: colors.surface,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
  },
});
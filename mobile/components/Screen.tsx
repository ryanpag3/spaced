import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { View } from './Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from './Themed';

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  center?: boolean;
};

/**
 * A consistent screen wrapper component that handles safe areas and common layout patterns
 */
export default function Screen({
  children,
  style,
  padding = true,
  center = false,
}: ScreenProps) {
  const authBackgroundColor = useThemeColor({}, 'authBackground') as string;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: authBackgroundColor }]}>
      <View 
        style={[
          styles.container,
          { backgroundColor: authBackgroundColor },
          padding && styles.padding,
          center && styles.center,
          style
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padding: {
    padding: 24,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { Text } from './Themed';
import { useThemeColor } from './Themed';

type ErrorMessageProps = {
  message: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function ErrorMessage({
  message,
  style,
  textStyle,
}: ErrorMessageProps) {
  const errorColor = useThemeColor({}, 'authErrorText') as string;
  
  if (!message) return null;
  
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { color: errorColor }, textStyle]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});

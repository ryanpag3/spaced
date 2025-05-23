import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { Text } from './Themed';

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
  if (!message) return null;
  
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'center',
  },
  text: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
});

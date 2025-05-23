import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type FormProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export default function Form({ children, style }: FormProps) {
  return (
    <View style={[styles.formContainer, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
});

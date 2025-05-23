import { Link, LinkProps } from 'expo-router';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from './Themed';

type LinkButtonProps = Omit<LinkProps, 'style'> & {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'link';
};

export default function LinkButton({
  href,
  children,
  style,
  textStyle,
  variant = 'link',
  ...props
}: LinkButtonProps) {

  const containerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'link':
      default:
        return styles.linkButton;
    }
  };

  const textStyleByVariant = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'link':
      default:
        return styles.linkText;
    }
  };

  return (
    <TouchableOpacity style={[containerStyle(), style]}>
      <Link href={href}>
        <Text style={[textStyleByVariant(), textStyle]}>{children}</Text>
      </Link>
    </TouchableOpacity >
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    minHeight: 56,
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  primaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
});

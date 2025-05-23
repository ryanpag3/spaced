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
    <Link
      href={href}
      {...props}
    >
      <TouchableOpacity style={[containerStyle(), style]}>
        <Text style={[textStyleByVariant(), textStyle]}>{children}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  linkButton: {
    padding: 8,
  },
  primaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

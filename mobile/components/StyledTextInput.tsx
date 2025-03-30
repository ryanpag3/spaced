import { TextInputProps } from 'react-native';
import { TextInput } from './Themed';

export default function StyledTextInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      style={[
        {
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
        },
        props.style,
      ]}
    />
  )
}
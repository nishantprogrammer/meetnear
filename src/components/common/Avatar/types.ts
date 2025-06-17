import { StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';

export type AvatarSize = 'small' | 'medium' | 'large';
export type AvatarVariant = 'circular' | 'rounded' | 'square';

export interface AvatarProps {
  source?: ImageSourcePropType;
  size?: AvatarSize;
  variant?: AvatarVariant;
  name?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

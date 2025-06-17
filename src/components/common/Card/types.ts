import { StyleProp, ViewStyle } from 'react-native';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: any;
  textStyle?: any;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  color,
  style,
  textStyle,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing.lg,
        },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color || colors.primary} />
      {message && (
        <Text
          style={[
            styles.message,
            {
              color: colors.textSecondary,
              ...typography.body2,
              marginTop: spacing.sm,
            },
            textStyle,
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
  },
});

export default LoadingState;

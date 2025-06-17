import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme';
import PropTypes from 'prop-types';
import styles from './styles';

const Card = ({ children, onPress, variant = 'elevated', style, contentStyle, ...props }) => {
  const { colors, spacing } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.background,
        };
      default:
        return {};
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        {
          padding: spacing.md,
          borderRadius: 8,
        },
        getVariantStyles(),
        style,
      ]}
      {...props}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Container>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  contentStyle: PropTypes.object,
  onPress: PropTypes.func,
  style: PropTypes.object,
  variant: PropTypes.oneOf(['elevated', 'outlined', 'filled']),
};

export default Card;

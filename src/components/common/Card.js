import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Card = ({ children, onPress, style, variant = 'elevated', padding = 'medium' }) => {
  const { colors, spacing } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 0,
        };
      case 'flat':
        return {
          backgroundColor: colors.surface,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: colors.surface,
          elevation: 2,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'small':
        return { padding: spacing.sm };
      case 'large':
        return { padding: spacing.lg };
      default:
        return { padding: spacing.md };
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, getVariantStyles(), getPaddingStyles(), style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});

Card.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func,
  padding: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
  variant: PropTypes.oneOf(['elevated', 'outlined', 'flat']),
};

export default Card;

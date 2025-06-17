import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';

const Button = ({
  onPress,
  title,
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  iconStyle,
  ...props
}) => {
  const { colors, typography, spacing } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'contained':
        return {
          backgroundColor: disabled ? colors.disabled : colors[color],
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.disabled : colors[color],
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textDisabled;
    if (variant === 'contained') return colors.white;
    return colors[color];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <Icon
        name={icon}
        size={size === 'small' ? 16 : 24}
        color={getTextColor()}
        style={[styles.icon, iconPosition === 'right' && styles.iconRight, iconStyle]}
      />
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size={size === 'small' ? 'small' : 'large'} />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                ...typography.button,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
};

Button.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  iconStyle: PropTypes.object,
  loading: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
  textStyle: PropTypes.object,
  title: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
};

export default Button;

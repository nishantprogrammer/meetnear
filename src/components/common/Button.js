import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  children,
}) => {
  const { colors, spacing, typography } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
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

  const getTextColor = () => {
    if (disabled) return colors.textDisabled;
    if (variant === 'secondary') return colors.primary;
    if (variant === 'text') return colors.primary;
    return colors.surface;
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} size="small" />;
    }

    if (children) {
      return children;
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Icon name={icon} size={20} color={getTextColor()} style={styles.leftIcon} />
        )}
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
        {icon && iconPosition === 'right' && (
          <Icon name={icon} size={20} color={getTextColor()} style={styles.rightIcon} />
        )}
      </View>
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
        {
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  loading: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
  textStyle: PropTypes.object,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'text', 'danger']),
};

export default Button;

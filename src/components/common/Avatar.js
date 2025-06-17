import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Avatar = ({
  source,
  size = 'medium',
  variant = 'circular',
  name,
  onPress,
  style,
  textStyle,
  showBadge,
  badgeProps,
}) => {
  const { colors, typography, spacing } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 32,
          height: 32,
          borderRadius: variant === 'circular' ? 16 : 4,
        };
      case 'large':
        return {
          width: 64,
          height: 64,
          borderRadius: variant === 'circular' ? 32 : 8,
        };
      default:
        return {
          width: 48,
          height: 48,
          borderRadius: variant === 'circular' ? 24 : 6,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.caption;
      case 'large':
        return typography.h6;
      default:
        return typography.body1;
    }
  };

  const getInitials = () => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
      {source ? (
        <Image source={source} style={[styles.image, getSizeStyles()]} />
      ) : (
        <View style={[styles.placeholder, getSizeStyles(), { backgroundColor: colors.primary }]}>
          <Text style={[styles.text, getTextSize(), { color: colors.surface }, textStyle]}>
            {getInitials()}
          </Text>
        </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.success,
              borderColor: colors.surface,
            },
          ]}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});

Avatar.propTypes = {
  badgeProps: PropTypes.object,
  name: PropTypes.string,
  onPress: PropTypes.func,
  showBadge: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  style: PropTypes.object,
  textStyle: PropTypes.object,
  variant: PropTypes.oneOf(['circular', 'rounded']),
};

export default Avatar;

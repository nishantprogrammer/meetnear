import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';

const Avatar = ({
  source,
  size = 'medium',
  variant = 'circular',
  name,
  onPress,
  style,
  imageStyle,
  textStyle,
  ...props
}) => {
  const { colors, typography, spacing } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
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

  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return getSize() / 2;
      case 'rounded':
        return 8;
      default:
        return 0;
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        {
          width: getSize(),
          height: getSize(),
          borderRadius: getBorderRadius(),
          backgroundColor: colors.primary,
        },
        style,
      ]}
      {...props}
    >
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: getSize(),
              height: getSize(),
              borderRadius: getBorderRadius(),
            },
            imageStyle,
          ]}
        />
      ) : name ? (
        <Text
          style={[
            styles.text,
            {
              color: colors.white,
              ...typography.subtitle1,
            },
            textStyle,
          ]}
        >
          {getInitials()}
        </Text>
      ) : (
        <Icon name="person" size={getSize() * 0.6} color={colors.white} />
      )}
    </Container>
  );
};

Avatar.propTypes = {
  imageStyle: PropTypes.object,
  name: PropTypes.string,
  onPress: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  style: PropTypes.object,
  textStyle: PropTypes.object,
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
};

export default Avatar;

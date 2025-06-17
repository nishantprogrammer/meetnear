import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Skeleton = ({ variant = 'rectangular', width, height, style, animation = 'pulse' }) => {
  const { colors } = useTheme();
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: Math.max(width, height) / 2,
        };
      case 'rounded':
        return {
          borderRadius: 8,
        };
      default:
        return {
          borderRadius: 0,
        };
    }
  };

  const getAnimationStyles = () => {
    if (animation === 'wave') {
      return {
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-width, width],
            }),
          },
        ],
      };
    }

    return {
      opacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      }),
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: colors.skeleton,
        },
        getVariantStyles(),
        style,
      ]}
      overflow="hidden"
    >
      <Animated.View
        style={[
          styles.animation,
          {
            backgroundColor: colors.skeletonHighlight,
          },
          getAnimationStyles(),
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  animation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

Skeleton.propTypes = {
  animation: PropTypes.oneOf(['pulse', 'wave']),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  style: PropTypes.object,
  variant: PropTypes.oneOf(['rectangular', 'circular', 'rounded']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Skeleton;

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Spinner = ({ size = 'medium', color, text, fullScreen = false, style }) => {
  const { colors, spacing, typography } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const containerStyle = [styles.container, fullScreen && styles.fullScreen, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={getSize()} color={color || colors.primary} />
      {text && (
        <Text
          style={[
            styles.text,
            {
              color: colors.text,
              ...typography.body2,
            },
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
  },
  text: {
    marginTop: 8,
  },
});

Spinner.propTypes = {
  color: PropTypes.string,
  fullScreen: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
  text: PropTypes.string,
};

export default Spinner;

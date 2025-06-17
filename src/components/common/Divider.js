import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Divider = ({
  orientation = 'horizontal',
  thickness = 1,
  color,
  style,
  spacing = 'medium',
}) => {
  const { colors, spacing: themeSpacing } = useTheme();

  const getSpacingStyles = () => {
    switch (spacing) {
      case 'small':
        return {
          marginVertical: orientation === 'horizontal' ? themeSpacing.sm : 0,
          marginHorizontal: orientation === 'vertical' ? themeSpacing.sm : 0,
        };
      case 'large':
        return {
          marginVertical: orientation === 'horizontal' ? themeSpacing.lg : 0,
          marginHorizontal: orientation === 'vertical' ? themeSpacing.lg : 0,
        };
      default:
        return {
          marginVertical: orientation === 'horizontal' ? themeSpacing.md : 0,
          marginHorizontal: orientation === 'vertical' ? themeSpacing.md : 0,
        };
    }
  };

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color || colors.border,
          height: orientation === 'horizontal' ? thickness : '100%',
          width: orientation === 'vertical' ? thickness : '100%',
        },
        getSpacingStyles(),
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    alignSelf: 'stretch',
  },
});

Divider.propTypes = {
  color: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  spacing: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
  thickness: PropTypes.number,
};

export default Divider;

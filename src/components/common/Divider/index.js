import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';
import PropTypes from 'prop-types';
import styles from './styles';

const Divider = ({ orientation = 'horizontal', thickness = 1, color, style, ...props }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color || colors.border,
          ...(orientation === 'horizontal'
            ? {
                height: thickness,
                width: '100%',
              }
            : {
                width: thickness,
                height: '100%',
              }),
        },
        style,
      ]}
      {...props}
    />
  );
};

Divider.propTypes = {
  color: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  style: PropTypes.object,
  thickness: PropTypes.number,
};

export default Divider;

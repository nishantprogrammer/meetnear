import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Stack = ({
  children,
  direction = 'vertical',
  spacing = 'medium',
  alignment = 'start',
  distribution = 'start',
  style,
  wrap = false,
}) => {
  const { spacing: themeSpacing } = useTheme();

  const getSpacing = () => {
    switch (spacing) {
      case 'small':
        return themeSpacing.sm;
      case 'large':
        return themeSpacing.lg;
      default:
        return themeSpacing.md;
    }
  };

  const getAlignment = () => {
    switch (alignment) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  };

  const getDistribution = () => {
    switch (distribution) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      case 'space-around':
        return 'space-around';
      case 'space-evenly':
        return 'space-evenly';
      default:
        return 'flex-start';
    }
  };

  const renderChildren = () => {
    const childrenArray = React.Children.toArray(children);
    const spacing = getSpacing();

    return childrenArray.map((child, index) => (
      <View
        key={index}
        style={[
          styles.child,
          {
            [direction === 'vertical' ? 'marginBottom' : 'marginRight']:
              index < childrenArray.length - 1 ? spacing : 0,
          },
        ]}
      >
        {child}
      </View>
    ));
  };

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          alignItems: getAlignment(),
          justifyContent: getDistribution(),
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    >
      {renderChildren()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  child: {
    flex: 0,
  },
});

Stack.propTypes = {
  alignment: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  distribution: PropTypes.oneOf([
    'start',
    'center',
    'end',
    'space-between',
    'space-around',
    'space-evenly',
  ]),
  spacing: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
  wrap: PropTypes.bool,
};

export default Stack;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Grid = ({ children, columns = 2, spacing = 'medium', style, itemStyle }) => {
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

  const renderChildren = () => {
    const childrenArray = React.Children.toArray(children);
    const rows = [];
    const spacing = getSpacing();

    for (let i = 0; i < childrenArray.length; i += columns) {
      const row = childrenArray.slice(i, i + columns);
      rows.push(
        <View
          key={i}
          style={[
            styles.row,
            {
              marginBottom: i < childrenArray.length - columns ? spacing : 0,
            },
          ]}
        >
          {row.map((child, index) => (
            <View
              key={index}
              style={[
                styles.item,
                {
                  width: `${100 / columns}%`,
                  paddingRight: index < row.length - 1 ? spacing : 0,
                },
                itemStyle,
              ]}
            >
              {child}
            </View>
          ))}
        </View>
      );
    }

    return rows;
  };

  return <View style={[styles.container, style]}>{renderChildren()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    flex: 1,
  },
});

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.number,
  itemStyle: PropTypes.object,
  spacing: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.object,
};

export default Grid;

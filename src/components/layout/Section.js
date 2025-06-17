import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Divider from '../common/Divider';

const Section = ({
  title,
  subtitle,
  children,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  action,
  headerComponent,
  showDivider = false,
  dividerProps,
  padding = 'medium',
  backgroundColor,
}) => {
  const { colors, typography, spacing } = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'small':
        return spacing.sm;
      case 'large':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          padding: getPadding(),
          backgroundColor: backgroundColor || colors.background,
        },
        style,
      ]}
    >
      {headerComponent || (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && (
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    ...typography.h6,
                  },
                  titleStyle,
                ]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    ...typography.body2,
                  },
                  subtitleStyle,
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {action && <View style={styles.action}>{action}</View>}
        </View>
      )}
      {showDivider && <Divider {...dividerProps} />}
      <View
        style={[
          styles.content,
          {
            marginTop: (title || subtitle) && !headerComponent ? spacing.sm : 0,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 4,
  },
  action: {
    flex: 0,
  },
  content: {
    width: '100%',
  },
});

Section.propTypes = {
  action: PropTypes.node,
  backgroundColor: PropTypes.string,
  children: PropTypes.node.isRequired,
  contentStyle: PropTypes.object,
  dividerProps: PropTypes.object,
  headerComponent: PropTypes.node,
  padding: PropTypes.oneOf(['small', 'medium', 'large']),
  showDivider: PropTypes.bool,
  style: PropTypes.object,
  subtitle: PropTypes.string,
  subtitleStyle: PropTypes.object,
  title: PropTypes.string,
  titleStyle: PropTypes.object,
};

export default Section;

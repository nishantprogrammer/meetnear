import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tabs = ({
  tabs,
  activeTab,
  onChange,
  variant = 'primary',
  scrollable = false,
  style,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
  iconStyle,
  activeIconStyle,
}) => {
  const { colors, typography, spacing } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        };
      case 'pills':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderBottomColor: colors.primary,
          borderBottomWidth: 2,
        };
    }
  };

  const getTabStyles = isActive => {
    const baseStyles = {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (variant === 'pills') {
      return {
        ...baseStyles,
        backgroundColor: isActive ? colors.primary : colors.surface,
        borderRadius: 20,
        marginHorizontal: spacing.xs,
      };
    }

    return {
      ...baseStyles,
      borderBottomWidth: isActive ? 2 : 0,
      borderBottomColor: colors.primary,
    };
  };

  const getTextStyles = isActive => {
    const baseStyles = {
      ...typography.button,
      color: isActive ? colors.primary : colors.textSecondary,
    };

    if (variant === 'pills') {
      return {
        ...baseStyles,
        color: isActive ? colors.surface : colors.text,
      };
    }

    return baseStyles;
  };

  const renderTab = (tab, index) => {
    const isActive = activeTab === index;

    return (
      <TouchableOpacity
        key={tab.id || index}
        style={[styles.tab, getTabStyles(isActive), tabStyle, isActive && activeTabStyle]}
        onPress={() => onChange(index)}
        activeOpacity={0.7}
      >
        {tab.icon && (
          <Icon
            name={tab.icon}
            size={20}
            color={isActive ? colors.primary : colors.textSecondary}
            style={[styles.icon, iconStyle, isActive && activeIconStyle]}
          />
        )}
        <Text
          style={[styles.text, getTextStyles(isActive), textStyle, isActive && activeTextStyle]}
        >
          {tab.label}
        </Text>
        {tab.badge && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: colors.surface,
                  ...typography.caption,
                },
              ]}
            >
              {tab.badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const Container = scrollable ? ScrollView : View;

  return (
    <Container
      style={[styles.container, getVariantStyles(), style]}
      horizontal={scrollable}
      showsHorizontalScrollIndicator={false}
    >
      {tabs.map(renderTab)}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tab: {
    minWidth: 100,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    textAlign: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontWeight: 'bold',
  },
});

Tabs.propTypes = {
  activeIconStyle: PropTypes.object,
  activeTab: PropTypes.number.isRequired,
  activeTabStyle: PropTypes.object,
  activeTextStyle: PropTypes.object,
  iconStyle: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  scrollable: PropTypes.bool,
  style: PropTypes.object,
  tabStyle: PropTypes.object,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  textStyle: PropTypes.object,
  variant: PropTypes.oneOf(['primary', 'secondary', 'pills']),
};

export default Tabs;

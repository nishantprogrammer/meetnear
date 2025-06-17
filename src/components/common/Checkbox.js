import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Checkbox = ({ label, checked, onChange, disabled, error, style, accessibilityLabel }) => {
  const { colors, spacing, typography } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleAccessibilityAction = () => {
    AccessibilityInfo.announceForAccessibility(`${label} ${checked ? 'unchecked' : 'checked'}`);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.checkboxContainer, disabled && { opacity: 0.5 }]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityActions={[{ name: 'activate', label: 'Toggle checkbox' }]}
        onAccessibilityAction={handleAccessibilityAction}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: error ? colors.error : colors.border,
              backgroundColor: checked ? colors.primary : 'transparent',
            },
          ]}
        >
          {checked && <Icon name="check" size={20} color={colors.surface} />}
        </View>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                ...typography.body1,
              },
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
      {error && (
        <Text
          style={[
            styles.error,
            {
              color: colors.error,
              ...typography.caption,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
  error: {
    marginTop: 4,
  },
});

Checkbox.propTypes = {
  accessibilityLabel: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object,
};

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
};

export default Checkbox;

import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  disabled,
  multiline,
  numberOfLines,
  style,
  ...props
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text, ...typography.body2 }]}>{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            ...typography.body1,
          },
          disabled && { opacity: 0.5 },
        ]}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.error, ...typography.caption }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  error: {
    marginTop: 4,
  },
});

Input.propTypes = {
  autoCapitalize: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  keyboardType: PropTypes.string,
  label: PropTypes.string,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  style: PropTypes.object,
  value: PropTypes.string,
};

Input.defaultProps = {
  secureTextEntry: false,
  keyboardType: 'default',
  autoCapitalize: 'none',
  disabled: false,
  multiline: false,
  numberOfLines: 1,
};

export default Input;

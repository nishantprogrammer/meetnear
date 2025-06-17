import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TextInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  multiline,
  numberOfLines,
  maxLength,
  error,
  disabled,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  ...props
}) => {
  const { colors, typography, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: getBorderColor(),
          backgroundColor: disabled ? colors.disabled : colors.background,
          paddingHorizontal: spacing.md,
          paddingVertical: multiline ? spacing.sm : 0,
        },
        style,
      ]}
    >
      {leftIcon && (
        <Icon name={leftIcon} size={24} color={colors.textSecondary} style={styles.leftIcon} />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={!disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.input,
          {
            color: colors.text,
            ...typography.body1,
            height: multiline ? undefined : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          inputStyle,
        ]}
        {...props}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
          <Icon
            name={isPasswordVisible ? 'visibility' : 'visibility-off'}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
      {rightIcon && !secureTextEntry && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
          <Icon name={rightIcon} size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

TextInput.propTypes = {
  autoCapitalize: PropTypes.string,
  autoCorrect: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  inputStyle: PropTypes.object,
  keyboardType: PropTypes.string,
  leftIcon: PropTypes.string,
  maxLength: PropTypes.number,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  onChangeText: PropTypes.func,
  onRightIconPress: PropTypes.func,
  placeholder: PropTypes.string,
  rightIcon: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  style: PropTypes.object,
  value: PropTypes.string,
};

TextInput.defaultProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  multiline: false,
  numberOfLines: 1,
  keyboardType: 'default',
};

export default TextInput;

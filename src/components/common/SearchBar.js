import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchBar = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  autoFocus = false,
  style,
  inputStyle,
  clearButtonStyle,
  iconStyle,
}) => {
  const { colors, typography, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
        },
        style,
      ]}
    >
      <Icon name="search" size={20} color={colors.textSecondary} style={[styles.icon, iconStyle]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          {
            color: colors.text,
            ...typography.body1,
          },
          inputStyle,
        ]}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        clearButtonMode="never"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity
          onPress={() => {
            onClear?.();
            onChangeText('');
          }}
          style={[styles.clearButton, clearButtonStyle]}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
});

SearchBar.propTypes = {
  autoFocus: PropTypes.bool,
  clearButtonStyle: PropTypes.object,
  iconStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  onChangeText: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  value: PropTypes.string.isRequired,
};

export default SearchBar;

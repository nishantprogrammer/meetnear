import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import { useField } from 'formik';

const FormField = ({
  name,
  label,
  required,
  helperText,
  error,
  children,
  style,
  labelStyle,
  helperTextStyle,
  errorStyle,
}) => {
  const { colors, typography, spacing } = useTheme();
  const [field, meta] = useField(name);
  const hasError = error || (meta.touched && meta.error);

  return (
    <View
      style={[
        styles.container,
        {
          marginBottom: spacing.md,
        },
        style,
      ]}
    >
      {label && (
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                ...typography.subtitle2,
              },
              labelStyle,
            ]}
          >
            {label}
            {required && (
              <Text
                style={[
                  styles.required,
                  {
                    color: colors.error,
                  },
                ]}
              >
                {' *'}
              </Text>
            )}
          </Text>
        </View>
      )}
      {React.cloneElement(children, {
        ...field,
        error: hasError,
      })}
      {(helperText || hasError) && (
        <Text
          style={[
            styles.helperText,
            {
              color: hasError ? colors.error : colors.textSecondary,
              ...typography.caption,
            },
            hasError ? errorStyle : helperTextStyle,
          ]}
        >
          {hasError ? error || meta.error : helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
  },
  required: {
    marginLeft: 4,
  },
  helperText: {
    marginTop: 4,
  },
});

FormField.propTypes = {
  children: PropTypes.element.isRequired,
  error: PropTypes.string,
  errorStyle: PropTypes.object,
  helperText: PropTypes.string,
  helperTextStyle: PropTypes.object,
  label: PropTypes.string,
  labelStyle: PropTypes.object,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  style: PropTypes.object,
};

export default FormField;

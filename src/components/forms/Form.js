import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as Yup from 'yup';

const Form = ({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  style,
  contentContainerStyle,
  scrollable = true,
  keyboardAvoiding = true,
}) => {
  const { colors, spacing } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values, { setErrors, resetForm }) => {
      try {
        setIsSubmitting(true);
        await onSubmit(values, { setErrors, resetForm });
      } catch (error) {
        if (error.errors) {
          setErrors(error.errors);
        } else {
          setErrors({ submit: error.message });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );

  const renderContent = formikProps => {
    const content = (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            padding: spacing.md,
          },
          style,
        ]}
      >
        {typeof children === 'function' ? children({ ...formikProps, isSubmitting }) : children}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      );
    }

    return content;
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {formikProps => {
        const content = renderContent(formikProps);

        if (keyboardAvoiding) {
          return (
            <KeyboardAvoidingView
              style={styles.keyboardAvoiding}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
              {content}
            </KeyboardAvoidingView>
          );
        }

        return content;
      }}
    </Formik>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

Form.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  contentContainerStyle: PropTypes.object,
  initialValues: PropTypes.object.isRequired,
  keyboardAvoiding: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  scrollable: PropTypes.bool,
  style: PropTypes.object,
  validationSchema: PropTypes.object,
};

export default Form;

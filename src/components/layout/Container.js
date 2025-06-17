import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';

const Container = ({
  children,
  scrollable = false,
  safeArea = true,
  keyboardAvoiding = false,
  style,
  contentContainerStyle,
  ...props
}) => {
  const { colors, spacing } = useTheme();

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={[
            styles.scrollView,
            {
              backgroundColor: colors.background,
            },
            style,
          ]}
          contentContainerStyle={[
            styles.scrollContent,
            {
              padding: spacing.md,
            },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          {...props}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            padding: spacing.md,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  };

  const content = renderContent();

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  if (safeArea) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {content}
      </SafeAreaView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

Container.propTypes = {
  children: PropTypes.node.isRequired,
  contentContainerStyle: PropTypes.object,
  keyboardAvoiding: PropTypes.bool,
  safeArea: PropTypes.bool,
  scrollable: PropTypes.bool,
  style: PropTypes.object,
};

export default Container;

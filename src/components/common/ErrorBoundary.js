import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback({
          error,
          errorInfo,
          reset: this.handleReset,
        });
      }

      return <ErrorFallback error={error} errorInfo={errorInfo} onReset={this.handleReset} />;
    }

    return children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Icon name="error-outline" size={48} color={colors.error} style={styles.icon} />
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            ...typography.h5,
          },
        ]}
      >
        Oops! Something went wrong
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: colors.textSecondary,
            ...typography.body2,
          },
        ]}
      >
        {error?.message || 'An unexpected error occurred'}
      </Text>
      {__DEV__ && errorInfo && (
        <Text
          style={[
            styles.stack,
            {
              color: colors.textSecondary,
              ...typography.caption,
            },
          ]}
        >
          {errorInfo.componentStack}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={onReset}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: colors.surface,
              ...typography.button,
            },
          ]}
        >
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    marginBottom: 16,
    textAlign: 'center',
  },
  stack: {
    marginBottom: 16,
    textAlign: 'left',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    textTransform: 'uppercase',
  },
});

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  onReset: PropTypes.func.isRequired,
};

export default ErrorBoundary;

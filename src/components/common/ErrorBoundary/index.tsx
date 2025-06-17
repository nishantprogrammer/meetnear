import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.error,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.white,
            ...typography.h6,
          },
        ]}
      >
        Something went wrong
      </Text>
      {error && (
        <Text
          style={[
            styles.message,
            {
              color: colors.white,
              ...typography.body2,
            },
          ]}
        >
          {error.message}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.white,
            marginTop: spacing.md,
          },
        ]}
        onPress={() => window.location.reload()}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: colors.error,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: 'center',
  },
});

export default ErrorBoundary;

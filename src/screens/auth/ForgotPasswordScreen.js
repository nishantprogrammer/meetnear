import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Button, TextInput, Text } from '../../components';
import { resetPassword } from '../../store/slices/authSlice';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(resetPassword(email)).unwrap();
      setIsSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container keyboardAvoiding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Section
          style={styles.section}
          title="Reset Password"
          subtitle="Enter your email to receive reset instructions"
        >
          {isSuccess ? (
            <View style={styles.successContainer}>
              <Text style={[styles.successText, { color: colors.success }]}>
                Password reset instructions have been sent to your email.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => navigation.navigate('Login')}
                style={styles.button}
              />
            </View>
          ) : (
            <>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={isLoading}
                style={styles.button}
              />

              <Button
                title="Back to Login"
                variant="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.linkButton}
              />
            </>
          )}
        </Section>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginTop: 24,
  },
  linkButton: {
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default ForgotPasswordScreen; 
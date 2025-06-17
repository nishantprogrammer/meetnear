import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Button, TextInput, Text } from '../../components';
import { login } from '../../store/slices/authSlice';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await dispatch(login(formData)).unwrap();
    } catch (error) {
      setErrors({ submit: error.message });
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
          title="Welcome Back"
          subtitle="Sign in to continue"
        >
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              setErrors({ ...errors, email: null });
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            secureTextEntry
            autoComplete="password"
          />

          {errors.submit && (
            <Text style={[styles.error, { color: colors.error }]}>
              {errors.submit}
            </Text>
          )}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.button}
          />

          <Button
            title="Forgot Password?"
            variant="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.linkButton}
          />

          <View style={styles.registerContainer}>
            <Text style={{ color: colors.textSecondary }}>
              Don't have an account?{' '}
            </Text>
            <Button
              title="Sign Up"
              variant="text"
              onPress={() => navigation.navigate('Register')}
            />
          </View>
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
  error: {
    marginTop: 8,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
});

export default LoginScreen; 
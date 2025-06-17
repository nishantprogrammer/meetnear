import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Button, TextInput, Text } from '../../components';
import { register } from '../../store/slices/authSlice';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await dispatch(register(formData)).unwrap();
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
          title="Create Account"
          subtitle="Sign up to get started"
        >
          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              setErrors({ ...errors, name: null });
            }}
            error={errors.name}
            autoCapitalize="words"
            autoComplete="name"
          />

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
            autoComplete="password-new"
          />

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, confirmPassword: text });
              setErrors({ ...errors, confirmPassword: null });
            }}
            error={errors.confirmPassword}
            secureTextEntry
            autoComplete="password-new"
          />

          {errors.submit && (
            <Text style={[styles.error, { color: colors.error }]}>
              {errors.submit}
            </Text>
          )}

          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={{ color: colors.textSecondary }}>
              Already have an account?{' '}
            </Text>
            <Button
              title="Sign In"
              variant="text"
              onPress={() => navigation.navigate('Login')}
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
  error: {
    marginTop: 8,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
});

export default RegisterScreen; 
import { createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialState = {
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addMatcher(api.endpoints.login.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.token = payload.token;
        state.isAuthenticated = true;
      })
      .addMatcher(api.endpoints.login.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Login failed';
      })
      // Register
      .addMatcher(api.endpoints.register.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.register.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.token = payload.token;
        state.isAuthenticated = true;
      })
      .addMatcher(api.endpoints.register.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Registration failed';
      })
      // Forgot Password
      .addMatcher(api.endpoints.forgotPassword.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.forgotPassword.matchFulfilled, state => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.forgotPassword.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Password reset request failed';
      })
      // Reset Password
      .addMatcher(api.endpoints.resetPassword.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.resetPassword.matchFulfilled, state => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.resetPassword.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Password reset failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;

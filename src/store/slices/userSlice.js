import { createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialState = {
  profile: null,
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showLocation: true,
      showProfile: true,
      showStatus: true,
    },
    language: 'en',
    theme: 'light',
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, { payload }) => {
      state.profile = payload;
    },
    updateProfile: (state, { payload }) => {
      state.profile = { ...state.profile, ...payload };
    },
    setPreferences: (state, { payload }) => {
      state.preferences = { ...state.preferences, ...payload };
    },
    updateNotificationPreferences: (state, { payload }) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...payload,
      };
    },
    updatePrivacyPreferences: (state, { payload }) => {
      state.preferences.privacy = {
        ...state.preferences.privacy,
        ...payload,
      };
    },
    setLanguage: (state, { payload }) => {
      state.preferences.language = payload;
    },
    setTheme: (state, { payload }) => {
      state.preferences.theme = payload;
    },
    clearError: state => {
      state.error = null;
    },
    reset: state => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      // Get Current User
      .addMatcher(api.endpoints.getCurrentUser.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.getCurrentUser.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload;
      })
      .addMatcher(api.endpoints.getCurrentUser.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to fetch user profile';
      })
      // Update Profile
      .addMatcher(api.endpoints.updateProfile.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload;
      })
      .addMatcher(api.endpoints.updateProfile.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to update profile';
      })
      // Upload Profile Image
      .addMatcher(api.endpoints.uploadProfileImage.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.uploadProfileImage.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = { ...state.profile, profileImage: payload.url };
      })
      .addMatcher(api.endpoints.uploadProfileImage.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to upload profile image';
      });
  },
});

export const {
  setProfile,
  updateProfile,
  setPreferences,
  updateNotificationPreferences,
  updatePrivacyPreferences,
  setLanguage,
  setTheme,
  clearError,
  reset,
} = userSlice.actions;

// Selectors
export const selectUserProfile = state => state.user.profile;
export const selectUserPreferences = state => state.user.preferences;
export const selectNotificationPreferences = state => state.user.preferences.notifications;
export const selectPrivacyPreferences = state => state.user.preferences.privacy;
export const selectUserLanguage = state => state.user.preferences.language;
export const selectUserTheme = state => state.user.preferences.theme;
export const selectUserLoading = state => state.user.loading;
export const selectUserError = state => state.user.error;

export default userSlice.reducer;

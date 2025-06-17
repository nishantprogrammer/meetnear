import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLocation: null,
  lastKnownLocation: null,
  watchId: null,
  loading: false,
  error: null,
  permissions: {
    location: null,
    background: null,
  },
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, { payload }) => {
      state.currentLocation = payload;
      state.lastKnownLocation = payload;
    },
    setLastKnownLocation: (state, { payload }) => {
      state.lastKnownLocation = payload;
    },
    setWatchId: (state, { payload }) => {
      state.watchId = payload;
    },
    clearWatchId: state => {
      state.watchId = null;
    },
    setLocationPermission: (state, { payload }) => {
      state.permissions.location = payload;
    },
    setBackgroundPermission: (state, { payload }) => {
      state.permissions.background = payload;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
    clearError: state => {
      state.error = null;
    },
    reset: state => {
      return initialState;
    },
  },
});

export const {
  setCurrentLocation,
  setLastKnownLocation,
  setWatchId,
  clearWatchId,
  setLocationPermission,
  setBackgroundPermission,
  setLoading,
  setError,
  clearError,
  reset,
} = locationSlice.actions;

// Selectors
export const selectCurrentLocation = state => state.location.currentLocation;
export const selectLastKnownLocation = state => state.location.lastKnownLocation;
export const selectLocationPermissions = state => state.location.permissions;
export const selectLocationLoading = state => state.location.loading;
export const selectLocationError = state => state.location.error;

export default locationSlice.reducer;

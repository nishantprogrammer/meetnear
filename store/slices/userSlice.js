import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  nearbyUsers: [],
  loading: false,
  error: null,
  filters: {
    maxDistance: 5,
    ageRange: [18, 50],
    interests: [],
    onlineOnly: false,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchProfileStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
    },
    fetchProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    fetchNearbyUsersStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchNearbyUsersSuccess: (state, action) => {
      state.loading = false;
      state.nearbyUsers = action.payload;
      state.error = null;
    },
    fetchNearbyUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearNearbyUsers: state => {
      state.nearbyUsers = [];
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfile,
  fetchNearbyUsersStart,
  fetchNearbyUsersSuccess,
  fetchNearbyUsersFailure,
  updateFilters,
  clearNearbyUsers,
} = userSlice.actions;

export default userSlice.reducer;

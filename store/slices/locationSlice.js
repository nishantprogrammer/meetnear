import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLocation: null,
  nearbyPlaces: [],
  meetingPoints: [],
  loading: false,
  error: null,
  watchId: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    startLocationTracking: (state, action) => {
      state.watchId = action.payload;
    },
    stopLocationTracking: state => {
      state.watchId = null;
    },
    fetchNearbyPlacesStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchNearbyPlacesSuccess: (state, action) => {
      state.loading = false;
      state.nearbyPlaces = action.payload;
      state.error = null;
    },
    fetchNearbyPlacesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    calculateMeetingPointStart: state => {
      state.loading = true;
      state.error = null;
    },
    calculateMeetingPointSuccess: (state, action) => {
      state.loading = false;
      state.meetingPoints.push(action.payload);
      state.error = null;
    },
    calculateMeetingPointFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearMeetingPoints: state => {
      state.meetingPoints = [];
    },
    clearNearbyPlaces: state => {
      state.nearbyPlaces = [];
    },
    setLocationError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
  fetchNearbyPlacesStart,
  fetchNearbyPlacesSuccess,
  fetchNearbyPlacesFailure,
  calculateMeetingPointStart,
  calculateMeetingPointSuccess,
  calculateMeetingPointFailure,
  clearMeetingPoints,
  clearNearbyPlaces,
  setLocationError,
} = locationSlice.actions;

export default locationSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialState = {
  nearbySessions: [],
  currentSession: null,
  loading: false,
  error: null,
  filters: {
    radius: 10,
    category: null,
    date: null,
  },
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentSession: (state, { payload }) => {
      state.currentSession = payload;
    },
    clearCurrentSession: state => {
      state.currentSession = null;
    },
    setFilters: (state, { payload }) => {
      state.filters = { ...state.filters, ...payload };
    },
    clearFilters: state => {
      state.filters = initialState.filters;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Get Nearby Sessions
      .addMatcher(api.endpoints.getNearbySessions.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.getNearbySessions.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.nearbySessions = payload;
      })
      .addMatcher(api.endpoints.getNearbySessions.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to fetch nearby sessions';
      })
      // Get Session Details
      .addMatcher(api.endpoints.getSessionDetails.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.getSessionDetails.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentSession = payload;
      })
      .addMatcher(api.endpoints.getSessionDetails.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to fetch session details';
      })
      // Create Session
      .addMatcher(api.endpoints.createSession.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.createSession.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentSession = payload;
        state.nearbySessions.unshift(payload);
      })
      .addMatcher(api.endpoints.createSession.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to create session';
      })
      // Update Session
      .addMatcher(api.endpoints.updateSession.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.updateSession.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentSession = payload;
        const index = state.nearbySessions.findIndex(session => session.id === payload.id);
        if (index !== -1) {
          state.nearbySessions[index] = payload;
        }
      })
      .addMatcher(api.endpoints.updateSession.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to update session';
      })
      // Join Session
      .addMatcher(api.endpoints.joinSession.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.joinSession.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        if (state.currentSession?.id === payload.id) {
          state.currentSession = payload;
        }
        const index = state.nearbySessions.findIndex(session => session.id === payload.id);
        if (index !== -1) {
          state.nearbySessions[index] = payload;
        }
      })
      .addMatcher(api.endpoints.joinSession.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to join session';
      })
      // Leave Session
      .addMatcher(api.endpoints.leaveSession.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.leaveSession.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        if (state.currentSession?.id === payload.id) {
          state.currentSession = payload;
        }
        const index = state.nearbySessions.findIndex(session => session.id === payload.id);
        if (index !== -1) {
          state.nearbySessions[index] = payload;
        }
      })
      .addMatcher(api.endpoints.leaveSession.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to leave session';
      });
  },
});

export const { setCurrentSession, clearCurrentSession, setFilters, clearFilters, clearError } =
  sessionSlice.actions;

export default sessionSlice.reducer;

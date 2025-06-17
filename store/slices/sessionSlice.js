import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeSession: null,
  sessions: [],
  invites: [],
  loading: false,
  error: null,
  paymentStatus: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    createSessionStart: state => {
      state.loading = true;
      state.error = null;
    },
    createSessionSuccess: (state, action) => {
      state.loading = false;
      state.activeSession = action.payload;
      state.sessions.push(action.payload);
      state.error = null;
    },
    createSessionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSession: (state, action) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = { ...state.sessions[index], ...action.payload };
      }
      if (state.activeSession?.id === action.payload.id) {
        state.activeSession = { ...state.activeSession, ...action.payload };
      }
    },
    endSession: (state, action) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = { ...state.sessions[index], ...action.payload };
      }
      if (state.activeSession?.id === action.payload.id) {
        state.activeSession = null;
      }
    },
    receiveInvite: (state, action) => {
      state.invites.push(action.payload);
    },
    acceptInvite: (state, action) => {
      const index = state.invites.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.invites.splice(index, 1);
      }
    },
    rejectInvite: (state, action) => {
      const index = state.invites.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.invites.splice(index, 1);
      }
    },
    updatePaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
    clearSessions: state => {
      state.sessions = [];
      state.activeSession = null;
      state.invites = [];
    },
  },
});

export const {
  createSessionStart,
  createSessionSuccess,
  createSessionFailure,
  updateSession,
  endSession,
  receiveInvite,
  acceptInvite,
  rejectInvite,
  updatePaymentStatus,
  clearSessions,
} = sessionSlice.actions;

export default sessionSlice.reducer;

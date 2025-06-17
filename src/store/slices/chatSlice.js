import { createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, { payload }) => {
      state.currentChat = payload;
      if (payload) {
        // Mark messages as read when opening chat
        state.messages = state.messages.map(message => ({
          ...message,
          read: true,
        }));
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearCurrentChat: state => {
      state.currentChat = null;
    },
    addMessage: (state, { payload }) => {
      state.messages.push(payload);
      if (!state.currentChat || state.currentChat.id !== payload.chatId) {
        state.unreadCount += 1;
      }
    },
    updateMessage: (state, { payload }) => {
      const index = state.messages.findIndex(msg => msg.id === payload.id);
      if (index !== -1) {
        state.messages[index] = payload;
      }
    },
    deleteMessage: (state, { payload }) => {
      state.messages = state.messages.filter(msg => msg.id !== payload);
    },
    clearMessages: state => {
      state.messages = [];
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Get Chats
      .addMatcher(api.endpoints.getChats.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.getChats.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.chats = payload;
      })
      .addMatcher(api.endpoints.getChats.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to fetch chats';
      })
      // Get Chat Messages
      .addMatcher(api.endpoints.getChatMessages.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.getChatMessages.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.messages = payload;
      })
      .addMatcher(api.endpoints.getChatMessages.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to fetch messages';
      })
      // Send Message
      .addMatcher(api.endpoints.sendMessage.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.sendMessage.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.messages.push(payload);
      })
      .addMatcher(api.endpoints.sendMessage.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to send message';
      })
      // Create Chat
      .addMatcher(api.endpoints.createChat.matchPending, state => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.createChat.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.chats.unshift(payload);
        state.currentChat = payload;
      })
      .addMatcher(api.endpoints.createChat.matchRejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.data?.message || 'Failed to create chat';
      });
  },
});

export const {
  setCurrentChat,
  clearCurrentChat,
  addMessage,
  updateMessage,
  deleteMessage,
  clearMessages,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;

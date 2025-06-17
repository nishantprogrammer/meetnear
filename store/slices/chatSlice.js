import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchMessagesStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action) => {
      state.loading = false;
      state.messages = action.payload;
      state.error = null;
    },
    fetchMessagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    sendMessageStart: state => {
      state.loading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action) => {
      state.loading = false;
      state.messages.push(action.payload);
      state.error = null;
    },
    sendMessageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    receiveMessage: (state, action) => {
      state.messages.push(action.payload);
      if (state.activeConversation?.id !== action.payload.conversationId) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const conversationId = action.payload;
      state.messages = state.messages.map(message => {
        if (message.conversationId === conversationId && !message.read) {
          return { ...message, read: true };
        }
        return message;
      });
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      if (action.payload) {
        state.messages = state.messages.map(message => {
          if (message.conversationId === action.payload.id) {
            return { ...message, read: true };
          }
          return message;
        });
      }
    },
    updateConversation: (state, action) => {
      const index = state.conversations.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...action.payload };
      }
    },
    clearChat: state => {
      state.messages = [];
      state.activeConversation = null;
      state.unreadCount = 0;
    },
  },
});

export const {
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  receiveMessage,
  markAsRead,
  setActiveConversation,
  updateConversation,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;

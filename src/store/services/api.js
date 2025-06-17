import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const { token } = getState().auth;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Session', 'Chat', 'Message'],
  endpoints: builder => ({
    // Auth endpoints
    login: builder.mutation({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: userData => ({
        url: 'auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: email => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),

    // User endpoints
    getCurrentUser: builder.query({
      query: () => 'users/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: profileData => ({
        url: 'users/me',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    uploadProfileImage: builder.mutation({
      query: imageData => ({
        url: 'users/me/profile-image',
        method: 'POST',
        body: imageData,
      }),
      invalidatesTags: ['User'],
    }),

    // Session endpoints
    getNearbySessions: builder.query({
      query: ({ latitude, longitude, radius = 10 }) => ({
        url: 'sessions',
        params: { latitude, longitude, radius },
      }),
      providesTags: ['Session'],
    }),
    getSessionDetails: builder.query({
      query: sessionId => `sessions/${sessionId}`,
      providesTags: (result, error, id) => [{ type: 'Session', id }],
    }),
    createSession: builder.mutation({
      query: sessionData => ({
        url: 'sessions',
        method: 'POST',
        body: sessionData,
      }),
      invalidatesTags: ['Session'],
    }),
    updateSession: builder.mutation({
      query: ({ sessionId, sessionData }) => ({
        url: `sessions/${sessionId}`,
        method: 'PATCH',
        body: sessionData,
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],
    }),
    joinSession: builder.mutation({
      query: sessionId => ({
        url: `sessions/${sessionId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [{ type: 'Session', id: sessionId }],
    }),
    leaveSession: builder.mutation({
      query: sessionId => ({
        url: `sessions/${sessionId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [{ type: 'Session', id: sessionId }],
    }),

    // Chat endpoints
    getChats: builder.query({
      query: () => 'chat',
      providesTags: ['Chat'],
    }),
    getChatMessages: builder.query({
      query: chatId => `chat/${chatId}/messages`,
      providesTags: (result, error, chatId) => [{ type: 'Message', id: chatId }],
    }),
    sendMessage: builder.mutation({
      query: ({ chatId, message }) => ({
        url: `chat/${chatId}/messages`,
        method: 'POST',
        body: message,
      }),
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Message', id: chatId }],
    }),
    createChat: builder.mutation({
      query: participants => ({
        url: 'chat',
        method: 'POST',
        body: { participants },
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useGetNearbySessionsQuery,
  useGetSessionDetailsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useJoinSessionMutation,
  useLeaveSessionMutation,
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useCreateChatMutation,
} = api;

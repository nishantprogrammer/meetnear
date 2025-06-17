import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import chatReducer from './slices/chatSlice';
import userReducer from './slices/userSlice';
import locationReducer from './slices/locationSlice';
import { api } from './services/api';

const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    chat: chatReducer,
    user: userReducer,
    location: locationReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export default store;

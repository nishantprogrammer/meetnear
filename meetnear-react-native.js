// ===== MEETNEAR 3.0 - COMPLETE REACT NATIVE APP =====
// Production-ready mobile app with stunning UI and real-time features

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Modal,
  Animated,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MapView, { Marker, Circle } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ErrorBoundary } from 'react-error-boundary';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';

// ===== REDUX STORE SETUP =====
import authReducer from './store/slices/authSlice';
import userReducer from './store/slices/userSlice';
import sessionReducer from './store/slices/sessionSlice';
import chatReducer from './store/slices/chatSlice';
import locationReducer from './store/slices/locationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    session: sessionReducer,
    chat: chatReducer,
    location: locationReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// ===== API CLIENT SETUP =====
const apiClient = axios.create({
  baseURL: 'https://your-backend-url.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      await AsyncStorage.removeItem('authToken');
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(error);
  }
);

// ===== THEME & CONSTANTS =====
const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  dark: '#2C3E50',
  light: '#ECF0F1',
  white: '#FFFFFF',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  gradient1: ['#FF6B6B', '#FF8E8E'],
  gradient2: ['#4ECDC4', '#7FDBDA'],
  gradient3: ['#45B7D1', '#6BB8D6'],
};

const FONTS = {
  regular: 'System',
  bold: 'System',
  light: 'System',
};

// ===== CUSTOM HOOKS =====
const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            throw new Error('Location permission denied');
          }
        }

        Geolocation.getCurrentPosition(
          position => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
          },
          error => {
            setError(error.message);
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, error, loading };
};

const useNotifications = () => {
  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        await AsyncStorage.setItem('fcmToken', token);
      }
    };

    requestPermission();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Toast.show({
        type: 'info',
        text1: remoteMessage.notification.title,
        text2: remoteMessage.notification.body,
      });
    });

    return unsubscribe;
  }, []);
};

// ===== COMPONENTS =====
const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const ErrorMessage = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

const CustomButton = ({ title, onPress, style, loading, disabled }) => (
  <TouchableOpacity
    style={[styles.button, style, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator color={COLORS.white} />
    ) : (
      <Text style={styles.buttonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

// ===== SCREENS =====
const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          navigation.replace('Main');
        } else {
          navigation.replace('Auth');
        }
      } catch (error) {
        navigation.replace('Auth');
      }
    };

    const timer = setTimeout(checkAuth, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashText}>MeetNear</Text>
    </View>
  );
};

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleAuth = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/login', { email, password });
      await AsyncStorage.setItem('authToken', response.data.token);
      dispatch({ type: 'auth/login', payload: response.data.user });
      navigation.replace('Main');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomButton
        title="Login"
        onPress={handleAuth}
        loading={loading}
        disabled={!email || !password}
      />
    </SafeAreaView>
  );
};

const DiscoveryScreen = ({ navigation }) => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiService = new APIService();

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required');
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        await apiService.updateLocation(latitude, longitude);
        const users = await apiService.findNearbyUsers(latitude, longitude);
        setNearbyUsers(users);
      },
      error => Alert.alert('Error', error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  useEffect(() => {
    requestLocationPermission();
    getCurrentLocation();
  }, []);

  const handleSendInvite = async (toUserId, message, location) => {
    try {
      await apiService.sendInvite(toUserId, message, location);
      Alert.alert('Success', 'Invite sent successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderUserCard = user => (
    <View key={user.uid} style={styles.userCard}>
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userDistance}>{user.distance} km away</Text>
      <TouchableOpacity
        style={styles.inviteButton}
        onPress={() => handleSendInvite(user.uid, 'Hello!', user.location)}
      >
        <Text style={styles.inviteButtonText}>Send Invite</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.discoveryContainer}>
      <ScrollView>{nearbyUsers.map(renderUserCard)}</ScrollView>
    </SafeAreaView>
  );
};

const MapScreen = () => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      error => Alert.alert('Error', error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <View style={styles.mapContainer}>
      <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion} />
    </View>
  );
};

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const apiService = new APIService();

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await apiService.sendMessage('sessionId', newMessage);
      setNewMessage('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.chatContainer}>
      <ScrollView>
        {messages.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            <Text style={styles.messageText}>{message.message}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const apiService = new APIService();

  const loadUserProfile = async () => {
    try {
      const insights = await apiService.generateUserInsights();
      setUser(insights);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      navigation.replace('Auth');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.profileContainer}>
      {user && (
        <View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const apiService = new APIService();

  const handleBookSession = async () => {
    try {
      const sessionId = await apiService.createSession(
        apiService.currentUser.uid,
        userId,
        user.location
      );
      navigation.navigate('Chat', { sessionId });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.userProfileContainer}>
      {user && (
        <View>
          <Text style={styles.userProfileName}>{user.name}</Text>
          <Text style={styles.userProfileBio}>{user.bio}</Text>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookSession}>
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const apiService = new APIService();

  const renderNotification = notification => (
    <View key={notification.id} style={styles.notificationContainer}>
      <Text style={styles.notificationTitle}>{notification.title}</Text>
      <Text style={styles.notificationBody}>{notification.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.notificationsContainer}>
      <ScrollView>{notifications.map(renderNotification)}</ScrollView>
    </SafeAreaView>
  );
};

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    maxDistance: 5,
    ageRange: [18, 50],
    notifications: true,
  });
  const apiService = new APIService();

  const updateSettings = async newSettings => {
    try {
      await apiService.trackUserEvent('updateSettings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Max Distance (km)</Text>
        <TextInput
          style={styles.settingInput}
          value={settings.maxDistance.toString()}
          onChangeText={value => updateSettings({ ...settings, maxDistance: parseInt(value) })}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Age Range</Text>
        <TextInput
          style={styles.settingInput}
          value={`${settings.ageRange[0]} - ${settings.ageRange[1]}`}
          onChangeText={value => {
            const [min, max] = value.split('-').map(Number);
            updateSettings({ ...settings, ageRange: [min, max] });
          }}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Notifications</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => updateSettings({ ...settings, notifications: !settings.notifications })}
        >
          <Text style={styles.toggleButtonText}>{settings.notifications ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </ErrorBoundary>
    </Provider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  splashText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  discoveryContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  userCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDistance: {
    fontSize: 14,
    color: COLORS.dark,
  },
  inviteButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  inviteButtonText: {
    color: COLORS.white,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  messageContainer: {
    padding: 8,
    backgroundColor: COLORS.light,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: COLORS.white,
  },
  profileContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 16,
    color: COLORS.dark,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    padding: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  logoutButtonText: {
    color: COLORS.white,
    textAlign: 'center',
  },
  userProfileContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  userProfileName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userProfileBio: {
    fontSize: 16,
    color: COLORS.dark,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  bookButtonText: {
    color: COLORS.white,
    textAlign: 'center',
  },
  notificationsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  notificationContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    color: COLORS.dark,
  },
  settingsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  settingInput: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  toggleButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 4,
  },
  toggleButtonText: {
    color: COLORS.white,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.danger,
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 4,
  },
  errorButtonText: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default App;

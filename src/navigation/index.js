import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SessionsScreen from '../screens/main/SessionsScreen';
import ChatScreen from '../screens/main/ChatScreen';
import SessionDetailsScreen from '../screens/main/SessionDetailsScreen';
import CreateSessionScreen from '../screens/main/CreateSessionScreen';
import ChatDetailsScreen from '../screens/main/ChatDetailsScreen';

// Components
import { colors } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="SessionDetails" component={SessionDetailsScreen} />
    <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
  </Stack.Navigator>
);

const SessionsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Sessions" component={SessionsScreen} />
    <Stack.Screen name="SessionDetails" component={SessionDetailsScreen} />
    <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Chats" component={ChatScreen} />
    <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'SessionsTab':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'ChatTab':
            iconName = focused ? 'chat' : 'chat-outline';
            break;
          case 'ProfileTab':
            iconName = focused ? 'account' : 'account-outline';
            break;
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.text.secondary,
      headerShown: false,
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
    <Tab.Screen name="SessionsTab" component={SessionsStack} options={{ title: 'Sessions' }} />
    <Tab.Screen name="ChatTab" component={ChatStack} options={{ title: 'Chat' }} />
    <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

const Navigation = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <NavigationContainer>{isAuthenticated ? <MainTabs /> : <AuthStack />}</NavigationContainer>
  );
};

export default Navigation;

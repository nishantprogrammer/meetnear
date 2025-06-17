import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Button, Text, Card, Switch } from '../../components';
import { updateProfile, logout } from '../../store/slices/authSlice';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets?.[0]) {
        setIsLoading(true);
        await dispatch(updateProfile({ photoURL: result.assets[0].uri })).unwrap();
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView>
        <Section title="Profile">
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  user?.photoURL
                    ? { uri: user.photoURL }
                    : require('../../assets/default-avatar.png')
                }
                style={styles.avatar}
              />
              <Button
                title="Change Photo"
                variant="text"
                onPress={handleImagePicker}
                loading={isLoading}
                style={styles.changePhotoButton}
              />
            </View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </Section>

        <Section title="Settings">
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive notifications about new messages and sessions
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Location Services</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Allow app to access your location
                </Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
              />
            </View>
          </Card>
        </Section>

        <Section>
          <Button
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.button}
          />
          <Button
            title="Logout"
            variant="outlined"
            onPress={handleLogout}
            loading={isLoading}
            style={styles.button}
          />
        </Section>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  button: {
    marginBottom: 16,
  },
});

export default ProfileScreen; 
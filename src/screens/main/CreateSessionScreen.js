import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Button, TextInput, Text, Card } from '../../components';
import { createSession } from '../../store/slices/sessionSlice';
import { getCurrentLocation } from '../../utils/location';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';

const CreateSessionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    maxParticipants: '',
  });

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      setError('Error getting location. Please enable location services.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData({ ...formData, time: selectedTime });
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.maxParticipants) {
      setError('Maximum participants is required');
      return false;
    }
    if (!location) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const handleCreateSession = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const sessionData = {
        ...formData,
        location,
        startTime: new Date(
          formData.date.getFullYear(),
          formData.date.getMonth(),
          formData.date.getDate(),
          formData.time.getHours(),
          formData.time.getMinutes()
        ),
      };
      await dispatch(createSession(sessionData)).unwrap();
      navigation.goBack();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container keyboardAvoiding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView>
          <Section title="Create New Session">
            <Card style={styles.formCard}>
              <TextInput
                label="Title"
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                  setError('');
                }}
                error={error && !formData.title ? 'Title is required' : ''}
                placeholder="Enter session title"
              />

              <TextInput
                label="Description"
                value={formData.description}
                onChangeText={(text) => {
                  setFormData({ ...formData, description: text });
                  setError('');
                }}
                error={error && !formData.description ? 'Description is required' : ''}
                placeholder="Enter session description"
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />

              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
                  <Button
                    title={formData.date.toLocaleDateString()}
                    variant="outlined"
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateTimeButton}
                  />
                </View>

                <View style={styles.dateTimeItem}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Time</Text>
                  <Button
                    title={formData.time.toLocaleTimeString()}
                    variant="outlined"
                    onPress={() => setShowTimePicker(true)}
                    style={styles.dateTimeButton}
                  />
                </View>
              </View>

              <TextInput
                label="Maximum Participants"
                value={formData.maxParticipants}
                onChangeText={(text) => {
                  setFormData({ ...formData, maxParticipants: text });
                  setError('');
                }}
                error={error && !formData.maxParticipants ? 'Maximum participants is required' : ''}
                placeholder="Enter maximum number of participants"
                keyboardType="numeric"
              />

              <View style={styles.mapContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
                {location ? (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                    />
                  </MapView>
                ) : (
                  <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface }]}>
                    <Text style={{ color: colors.textSecondary }}>
                      Loading location...
                    </Text>
                  </View>
                )}
              </View>

              {error && (
                <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
              )}

              <Button
                title="Create Session"
                onPress={handleCreateSession}
                loading={isLoading}
                style={styles.button}
              />
            </Card>
          </Section>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={formData.time}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCard: {
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeItem: {
    flex: 1,
    marginRight: 8,
  },
  dateTimeButton: {
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});

export default CreateSessionScreen; 
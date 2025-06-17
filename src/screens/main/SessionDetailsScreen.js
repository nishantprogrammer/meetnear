import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Button, Text, Card, Avatar } from '../../components';
import { fetchSessionDetails, joinSession, leaveSession } from '../../store/slices/sessionSlice';
import { formatDate, formatTime, formatDistance } from '../../utils/format';
import MapView, { Marker } from 'react-native-maps';

const SessionDetailsScreen = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { currentSession } = useSelector((state) => state.sessions);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      setIsLoading(true);
      await dispatch(fetchSessionDetails(sessionId)).unwrap();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      setIsLoading(true);
      await dispatch(joinSession(sessionId)).unwrap();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveSession = async () => {
    try {
      setIsLoading(true);
      await dispatch(leaveSession(sessionId)).unwrap();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isParticipant = currentSession?.participants?.some(
    (p) => p.id === user.id
  );

  if (isLoading) {
    return (
      <Container>
        <Section>
          <View style={styles.skeleton}>
            <Skeleton width="100%" height={200} style={styles.mapSkeleton} />
            <Skeleton width="100%" height={100} style={styles.skeleton} />
            <Skeleton width="100%" height={100} style={styles.skeleton} />
          </View>
        </Section>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Section>
          <EmptyState
            title="Error Loading Session"
            description={error}
            action={{
              title: 'Try Again',
              onPress: loadSessionDetails,
            }}
          />
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView>
        <Section>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentSession.location.latitude,
                longitude: currentSession.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: currentSession.location.latitude,
                  longitude: currentSession.location.longitude,
                }}
                title={currentSession.title}
              />
            </MapView>
          </View>

          <Card style={styles.detailsCard}>
            <Text style={styles.title}>{currentSession.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {currentSession.description}
            </Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(currentSession.startTime)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Time</Text>
                <Text style={styles.infoValue}>{formatTime(currentSession.startTime)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</Text>
                <Text style={styles.infoValue}>{formatDistance(currentSession.distance)}</Text>
              </View>
            </View>

            <View style={styles.participantsContainer}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <View style={styles.participantsList}>
                {currentSession.participants.map((participant) => (
                  <View key={participant.id} style={styles.participant}>
                    <Avatar
                      source={
                        participant.photoURL
                          ? { uri: participant.photoURL }
                          : require('../../assets/default-avatar.png')
                      }
                      size={40}
                    />
                    <Text style={styles.participantName}>{participant.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {isParticipant ? (
              <Button
                title="Leave Session"
                variant="outlined"
                onPress={handleLeaveSession}
                loading={isLoading}
                style={styles.button}
              />
            ) : (
              <Button
                title="Join Session"
                onPress={handleJoinSession}
                loading={isLoading}
                style={styles.button}
              />
            )}
          </Card>
        </Section>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  detailsCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  participantsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participant: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 16,
  },
  participantName: {
    marginTop: 4,
    fontSize: 12,
  },
  button: {
    marginTop: 8,
  },
});

export default SessionDetailsScreen; 
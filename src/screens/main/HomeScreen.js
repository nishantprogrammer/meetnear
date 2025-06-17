import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Card, Button, Text, EmptyState, Skeleton } from '../../components';
import { fetchNearbySessions } from '../../store/slices/sessionSlice';
import { getCurrentLocation } from '../../utils/location';
import { formatDistance } from '../../utils/format';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  const { nearbySessions } = useSelector((state) => state.sessions);

  const loadData = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      await dispatch(fetchNearbySessions(currentLocation)).unwrap();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const renderSessions = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton width="100%" height={120} style={styles.skeleton} />
          <Skeleton width="100%" height={120} style={styles.skeleton} />
          <Skeleton width="100%" height={120} style={styles.skeleton} />
        </>
      );
    }

    if (error) {
      return (
        <EmptyState
          title="Error Loading Sessions"
          description={error}
          action={{
            title: 'Try Again',
            onPress: loadData,
          }}
        />
      );
    }

    if (!nearbySessions?.length) {
      return (
        <EmptyState
          title="No Sessions Nearby"
          description="There are no active sessions in your area. Why not create one?"
          action={{
            title: 'Create Session',
            onPress: () => navigation.navigate('CreateSession'),
          }}
        />
      );
    }

    return nearbySessions.map((session) => (
      <Card
        key={session.id}
        onPress={() => navigation.navigate('SessionDetails', { sessionId: session.id })}
        style={styles.sessionCard}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={[styles.sessionDistance, { color: colors.textSecondary }]}>
            {formatDistance(session.distance)}
          </Text>
        </View>
        <Text style={[styles.sessionDescription, { color: colors.textSecondary }]}>
          {session.description}
        </Text>
        <View style={styles.sessionFooter}>
          <Text style={[styles.sessionInfo, { color: colors.textSecondary }]}>
            {session.participantsCount} participants
          </Text>
          <Text style={[styles.sessionInfo, { color: colors.textSecondary }]}>
            {session.startTime}
          </Text>
        </View>
      </Card>
    ));
  };

  return (
    <Container>
      <Section
        title="Nearby Sessions"
        action={
          <Button
            title="Create"
            variant="text"
            onPress={() => navigation.navigate('CreateSession')}
          />
        }
      >
        <View style={styles.content}>
          {renderSessions()}
        </View>
      </Section>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  skeleton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  sessionCard: {
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionDistance: {
    fontSize: 14,
  },
  sessionDescription: {
    marginBottom: 12,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    fontSize: 14,
  },
});

export default HomeScreen; 
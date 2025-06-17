import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Card, Button, Text, EmptyState, Skeleton, Tabs } from '../../components';
import { fetchUserSessions } from '../../store/slices/sessionSlice';
import { formatDistance, formatDate } from '../../utils/format';

const SessionsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { userSessions } = useSelector((state) => state.sessions);

  useEffect(() => {
    loadSessions();
  }, [activeTab]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      await dispatch(fetchUserSessions(activeTab === 0 ? 'upcoming' : 'past')).unwrap();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSession = ({ item: session }) => (
    <Card
      onPress={() => navigation.navigate('SessionDetails', { sessionId: session.id })}
      style={styles.sessionCard}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={[styles.sessionStatus, { color: colors.primary }]}>
          {session.status}
        </Text>
      </View>
      <Text style={[styles.sessionDescription, { color: colors.textSecondary }]}>
        {session.description}
      </Text>
      <View style={styles.sessionInfo}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date</Text>
          <Text style={styles.infoValue}>{formatDate(session.startTime)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Time</Text>
          <Text style={styles.infoValue}>{session.startTime}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</Text>
          <Text style={styles.infoValue}>{formatDistance(session.distance)}</Text>
        </View>
      </View>
      <View style={styles.sessionFooter}>
        <Text style={[styles.participants, { color: colors.textSecondary }]}>
          {session.participantsCount} participants
        </Text>
        {activeTab === 0 && (
          <Button
            title="View Details"
            variant="text"
            onPress={() => navigation.navigate('SessionDetails', { sessionId: session.id })}
          />
        )}
      </View>
    </Card>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton width="100%" height={180} style={styles.skeleton} />
          <Skeleton width="100%" height={180} style={styles.skeleton} />
          <Skeleton width="100%" height={180} style={styles.skeleton} />
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
            onPress: loadSessions,
          }}
        />
      );
    }

    if (!userSessions?.length) {
      return (
        <EmptyState
          title={`No ${activeTab === 0 ? 'Upcoming' : 'Past'} Sessions`}
          description={
            activeTab === 0
              ? "You don't have any upcoming sessions. Why not create one?"
              : "You haven't participated in any sessions yet."
          }
          action={
            activeTab === 0
              ? {
                  title: 'Create Session',
                  onPress: () => navigation.navigate('CreateSession'),
                }
              : null
          }
        />
      );
    }

    return (
      <FlatList
        data={userSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <Container>
      <Section
        title="My Sessions"
        action={
          <Button
            title="Create"
            variant="text"
            onPress={() => navigation.navigate('CreateSession')}
          />
        }
      >
        <Tabs
          tabs={[
            { label: 'Upcoming' },
            { label: 'Past' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          style={styles.tabs}
        />
        {renderContent()}
      </Section>
    </Container>
  );
};

const styles = StyleSheet.create({
  tabs: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
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
  sessionStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionDescription: {
    marginBottom: 12,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    fontSize: 14,
  },
});

export default SessionsScreen; 
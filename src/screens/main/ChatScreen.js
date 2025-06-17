import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme';
import { Container, Section, Card, Text, EmptyState, Skeleton } from '../../components';
import { fetchChats } from '../../store/slices/chatSlice';
import { formatTime } from '../../utils/format';

const ChatScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { chats } = useSelector((state) => state.chats);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      await dispatch(fetchChats()).unwrap();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChat = ({ item: chat }) => {
    const otherUser = chat.participants.find((p) => p.id !== user.id);
    const lastMessage = chat.messages[chat.messages.length - 1];

    return (
      <Card
        onPress={() => navigation.navigate('ChatDetails', { chatId: chat.id })}
        style={styles.chatCard}
      >
        <View style={styles.chatContent}>
          <Image
            source={
              otherUser?.photoURL
                ? { uri: otherUser.photoURL }
                : require('../../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.userName}>{otherUser?.name}</Text>
              {lastMessage && (
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                  {formatTime(lastMessage.timestamp)}
                </Text>
              )}
            </View>
            {lastMessage ? (
              <Text
                style={[styles.lastMessage, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {lastMessage.senderId === user.id ? 'You: ' : ''}
                {lastMessage.text}
              </Text>
            ) : (
              <Text style={[styles.noMessages, { color: colors.textSecondary }]}>
                No messages yet
              </Text>
            )}
          </View>
        </View>
        {chat.unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.unreadCount, { color: colors.surface }]}>
              {chat.unreadCount}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton width="100%" height={80} style={styles.skeleton} />
          <Skeleton width="100%" height={80} style={styles.skeleton} />
          <Skeleton width="100%" height={80} style={styles.skeleton} />
        </>
      );
    }

    if (error) {
      return (
        <EmptyState
          title="Error Loading Chats"
          description={error}
          action={{
            title: 'Try Again',
            onPress: loadChats,
          }}
        />
      );
    }

    if (!chats?.length) {
      return (
        <EmptyState
          title="No Chats Yet"
          description="Start a conversation by joining a session or connecting with other users."
        />
      );
    }

    return (
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <Container>
      <Section title="Messages">{renderContent()}</Section>
    </Container>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  skeleton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  chatCard: {
    marginBottom: 16,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  noMessages: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 12,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatScreen; 
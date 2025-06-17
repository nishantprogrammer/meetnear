import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const ChatList = ({ chats, onChatPress, onChatLongPress, style }) => {
  const { colors, spacing, typography } = useTheme();

  const renderChatItem = ({ item }) => {
    const { lastMessage } = item;
    const { unreadCount } = item;

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          {
            backgroundColor: item.isActive ? `${colors.primary}10` : colors.surface,
          },
        ]}
        onPress={() => onChatPress?.(item)}
        onLongPress={() => onChatLongPress?.(item)}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.isOnline && (
            <View
              style={[
                styles.onlineIndicator,
                {
                  backgroundColor: colors.success,
                },
              ]}
            />
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[
                styles.name,
                {
                  color: colors.text,
                  ...typography.subtitle1,
                },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {lastMessage && (
              <Text
                style={[
                  styles.time,
                  {
                    color: colors.textSecondary,
                    ...typography.caption,
                  },
                ]}
              >
                {format(new Date(lastMessage.timestamp), 'HH:mm')}
              </Text>
            )}
          </View>
          <View style={styles.footer}>
            <Text
              style={[
                styles.lastMessage,
                {
                  color: unreadCount ? colors.text : colors.textSecondary,
                  ...typography.body2,
                },
              ]}
              numberOfLines={1}
            >
              {lastMessage ? lastMessage.text : 'No messages yet'}
            </Text>
            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadBadge,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.unreadCount,
                    {
                      color: colors.surface,
                      ...typography.caption,
                    },
                  ]}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={chats}
      renderItem={renderChatItem}
      keyExtractor={item => item.id}
      contentContainerStyle={[styles.container, style]}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

ChatList.propTypes = {
  chats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      isOnline: PropTypes.bool,
      isActive: PropTypes.bool,
      lastMessage: PropTypes.shape({
        text: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
      }),
      unreadCount: PropTypes.number,
    })
  ).isRequired,
  onChatLongPress: PropTypes.func,
  onChatPress: PropTypes.func,
  style: PropTypes.object,
};

export default ChatList;

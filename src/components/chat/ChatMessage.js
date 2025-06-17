import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const ChatMessage = ({ message, isOwnMessage, onPress, onLongPress, onImagePress, style }) => {
  const { colors, spacing, typography } = useTheme();

  const renderMessageContent = () => {
    if (message.image) {
      return (
        <TouchableOpacity
          onPress={() => onImagePress?.(message.image)}
          style={styles.imageContainer}
        >
          <Image source={{ uri: message.image }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    return (
      <Text
        style={[
          styles.messageText,
          {
            color: isOwnMessage ? colors.surface : colors.text,
            ...typography.body1,
          },
        ]}
      >
        {message.text}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        },
        style,
      ]}
    >
      {!isOwnMessage && <Image source={{ uri: message.sender.avatar }} style={styles.avatar} />}
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: isOwnMessage ? colors.primary : colors.surface,
            marginLeft: isOwnMessage ? 0 : spacing.small,
            marginRight: isOwnMessage ? spacing.small : 0,
          },
        ]}
      >
        {!isOwnMessage && (
          <Text
            style={[
              styles.senderName,
              {
                color: colors.textSecondary,
                ...typography.caption,
              },
            ]}
          >
            {message.sender.name}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => onPress?.(message)}
          onLongPress={() => onLongPress?.(message)}
          style={styles.messageContent}
        >
          {renderMessageContent()}
        </TouchableOpacity>
        <View
          style={[
            styles.footer,
            {
              flexDirection: isOwnMessage ? 'row-reverse' : 'row',
            },
          ]}
        >
          <Text
            style={[
              styles.time,
              {
                color: isOwnMessage ? `${colors.surface}99` : colors.textSecondary,
                ...typography.caption,
              },
            ]}
          >
            {format(new Date(message.timestamp), 'HH:mm')}
          </Text>
          {isOwnMessage && (
            <Icon
              name={
                message.status === 'sent'
                  ? 'check'
                  : message.status === 'delivered'
                    ? 'done'
                    : 'done-all'
              }
              size={16}
              color={`${colors.surface}99`}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  senderName: {
    marginBottom: 4,
  },
  messageContent: {
    marginBottom: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 200,
  },
  footer: {
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
  },
  statusIcon: {
    marginLeft: 4,
  },
});

ChatMessage.propTypes = {
  isOwnMessage: PropTypes.bool,
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string,
    image: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['sending', 'sent', 'delivered', 'read']),
    sender: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onImagePress: PropTypes.func,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  style: PropTypes.object,
};

ChatMessage.defaultProps = {
  isOwnMessage: false,
};

export default ChatMessage;

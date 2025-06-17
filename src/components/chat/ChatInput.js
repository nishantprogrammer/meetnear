import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Platform } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmojiSelector from 'react-native-emoji-selector';

const ChatInput = ({ onSend, onImageSelect, placeholder, style }) => {
  const { colors, spacing, typography } = useTheme();
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message.trim());
      setMessage('');
      setShowEmoji(false);
    }
  };

  const handleEmojiSelect = emoji => {
    setMessage(prev => prev + emoji);
  };

  const handleImagePress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        onImageSelect?.(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showEmoji && (
        <View style={styles.emojiContainer}>
          <EmojiSelector
            onEmojiSelected={handleEmojiSelect}
            showSearchBar={false}
            showHistory
            showSectionTitles={false}
            columns={8}
          />
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.emojiButton} onPress={() => setShowEmoji(!showEmoji)}>
          <Icon name="emoji-emotions" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.text,
              ...typography.body1,
            },
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
          onFocus={() => setShowEmoji(false)}
        />
        <TouchableOpacity style={styles.imageButton} onPress={handleImagePress}>
          <Icon name="image" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: message.trim() ? colors.primary : colors.disabled,
            },
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Icon name="send" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  emojiContainer: {
    height: 250,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  emojiButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

ChatInput.propTypes = {
  onImageSelect: PropTypes.func,
  onSend: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
};

ChatInput.defaultProps = {
  placeholder: 'Type a message...',
};

export default ChatInput;

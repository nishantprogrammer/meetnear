import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Toast = ({ visible, message, type = 'info', duration = 3000, onClose, action, style }) => {
  const { colors, spacing, typography } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 5,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Icon name={getIcon()} size={24} color={colors.surface} style={styles.icon} />
        <Text
          style={[
            styles.message,
            {
              color: colors.surface,
              ...typography.body2,
            },
          ]}
        >
          {message}
        </Text>
      </View>
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <Text
            style={[
              styles.actionText,
              {
                color: colors.surface,
                ...typography.button,
              },
            ]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Icon name="close" size={20} color={colors.surface} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
  },
  actionButton: {
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    textTransform: 'uppercase',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

Toast.propTypes = {
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
  }),
  duration: PropTypes.number,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  style: PropTypes.object,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  visible: PropTypes.bool.isRequired,
};

export default Toast;

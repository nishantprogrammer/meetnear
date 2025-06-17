import React, { useEffect } from 'react';
import {
  View,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Modal = ({
  visible,
  onClose,
  children,
  title,
  showCloseButton = true,
  animationType = 'slide',
  transparent = true,
  style,
}) => {
  const { colors, spacing, typography } = useTheme();
  const translateY = new Animated.Value(SCREEN_HEIGHT);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <Animated.View
            style={[
              styles.content,
              {
                backgroundColor: colors.surface,
                transform: [{ translateY }],
              },
              style,
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && (
                    <Text
                      style={[
                        styles.title,
                        {
                          color: colors.text,
                          ...typography.h6,
                        },
                      ]}
                    >
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Icon name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {children}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});

Modal.propTypes = {
  animationType: PropTypes.oneOf(['none', 'slide', 'fade']),
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  showCloseButton: PropTypes.bool,
  style: PropTypes.object,
  title: PropTypes.string,
  transparent: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
};

export default Modal;

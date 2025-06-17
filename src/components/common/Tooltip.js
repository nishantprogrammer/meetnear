import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';

const Tooltip = ({
  content,
  children,
  position = 'top',
  trigger = 'press',
  style,
  contentStyle,
  textStyle,
  arrowStyle,
}) => {
  const { colors, typography, spacing } = useTheme();
  const [visible, setVisible] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const triggerRef = useRef(null);
  const { width: screenWidth } = Dimensions.get('window');

  const handlePress = () => {
    if (trigger === 'press') {
      triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setMeasurements({ x, y, width, height, pageX, pageY });
        setVisible(true);
      });
    }
  };

  const handleLongPress = () => {
    if (trigger === 'longPress') {
      triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setMeasurements({ x, y, width, height, pageX, pageY });
        setVisible(true);
      });
    }
  };

  const getPositionStyles = () => {
    if (!measurements) return {};

    const { pageX, pageY, width, height } = measurements;
    const tooltipWidth = 200; // Approximate width of tooltip
    const tooltipHeight = 40; // Approximate height of tooltip
    const arrowSize = 8;

    switch (position) {
      case 'bottom':
        return {
          top: pageY + height + arrowSize,
          left: Math.min(
            pageX + (width - tooltipWidth) / 2,
            screenWidth - tooltipWidth - spacing.md
          ),
        };
      case 'left':
        return {
          top: pageY + (height - tooltipHeight) / 2,
          left: pageX - tooltipWidth - arrowSize,
        };
      case 'right':
        return {
          top: pageY + (height - tooltipHeight) / 2,
          left: pageX + width + arrowSize,
        };
      default: // top
        return {
          top: pageY - tooltipHeight - arrowSize,
          left: Math.min(
            pageX + (width - tooltipWidth) / 2,
            screenWidth - tooltipWidth - spacing.md
          ),
        };
    }
  };

  const getArrowStyles = () => {
    if (!measurements) return {};

    const { width } = measurements;
    const arrowSize = 8;

    switch (position) {
      case 'bottom':
        return {
          top: -arrowSize,
          left: width / 2 - arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: 0,
          borderBottomColor: colors.tooltip,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
        };
      case 'left':
        return {
          top: measurements.height / 2 - arrowSize,
          right: -arrowSize,
          borderLeftWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: 0,
          borderLeftColor: colors.tooltip,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: 'transparent',
        };
      case 'right':
        return {
          top: measurements.height / 2 - arrowSize,
          left: -arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: 0,
          borderRightColor: colors.tooltip,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        };
      default: // top
        return {
          bottom: -arrowSize,
          left: width / 2 - arrowSize,
          borderTopWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: 0,
          borderTopColor: colors.tooltip,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
        };
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={style}
      >
        {children}
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => setVisible(false)}>
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: colors.tooltip,
              },
              getPositionStyles(),
              contentStyle,
            ]}
          >
            <View style={[styles.arrow, getArrowStyles(), arrowStyle]} />
            <Text
              style={[
                styles.text,
                {
                  color: colors.surface,
                  ...typography.body2,
                },
                textStyle,
              ]}
            >
              {content}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
  },
  tooltip: {
    position: 'absolute',
    padding: 8,
    borderRadius: 4,
    maxWidth: 200,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  text: {
    textAlign: 'center',
  },
});

Tooltip.propTypes = {
  arrowStyle: PropTypes.object,
  children: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
  contentStyle: PropTypes.object,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  style: PropTypes.object,
  textStyle: PropTypes.object,
  trigger: PropTypes.oneOf(['press', 'longPress']),
};

export default Tooltip;

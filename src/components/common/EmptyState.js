import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Button from './Button';

const EmptyState = ({
  title,
  description,
  image,
  action,
  style,
  imageStyle,
  titleStyle,
  descriptionStyle,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {image && <Image source={image} style={[styles.image, imageStyle]} resizeMode="contain" />}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            ...typography.h6,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            {
              color: colors.textSecondary,
              ...typography.body2,
            },
            descriptionStyle,
          ]}
        >
          {description}
        </Text>
      )}
      {action && <Button {...action} style={[styles.action, action.style]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  action: {
    minWidth: 200,
  },
});

EmptyState.propTypes = {
  action: PropTypes.shape({
    title: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    style: PropTypes.object,
  }),
  description: PropTypes.string,
  descriptionStyle: PropTypes.object,
  image: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  imageStyle: PropTypes.object,
  style: PropTypes.object,
  title: PropTypes.string.isRequired,
  titleStyle: PropTypes.object,
};

export default EmptyState;

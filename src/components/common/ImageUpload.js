import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const ImageUpload = ({
  value,
  onChange,
  onError,
  aspectRatio = 1,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8,
  style,
}) => {
  const { colors, spacing, typography } = useTheme();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        onError?.('Permission to access media library was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [aspectRatio, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      onError?.(error.message);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        onError?.('Permission to access camera was denied');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [aspectRatio, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      onError?.(error.message);
    }
  };

  const processImage = async uri => {
    try {
      setLoading(true);
      setProgress(0);

      // Resize image
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            },
          },
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setProgress(100);
      onChange?.(manipResult.uri);
    } catch (error) {
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onChange?.(null);
  };

  return (
    <View style={[styles.container, style]}>
      {value ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: value }}
            style={[
              styles.preview,
              {
                aspectRatio,
                backgroundColor: colors.surface,
              },
            ]}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[
              styles.removeButton,
              {
                backgroundColor: colors.error,
              },
            ]}
            onPress={handleRemove}
          >
            <Icon name="close" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.uploadContainer,
            {
              aspectRatio,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={[
                  styles.progressText,
                  {
                    color: colors.text,
                    ...typography.caption,
                  },
                ]}
              >
                {progress}%
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={handleImagePick}
              >
                <Icon name="photo-library" size={24} color={colors.surface} />
                <Text
                  style={[
                    styles.uploadText,
                    {
                      color: colors.surface,
                      ...typography.button,
                    },
                  ]}
                >
                  Gallery
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  {
                    backgroundColor: colors.secondary,
                  },
                ]}
                onPress={handleCameraCapture}
              >
                <Icon name="camera-alt" size={24} color={colors.surface} />
                <Text
                  style={[
                    styles.uploadText,
                    {
                      color: colors.surface,
                      ...typography.button,
                    },
                  ]}
                >
                  Camera
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadContainer: {
    width: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  progressText: {
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  uploadText: {
    marginLeft: 8,
    textTransform: 'uppercase',
  },
});

ImageUpload.propTypes = {
  aspectRatio: PropTypes.number,
  maxHeight: PropTypes.number,
  maxWidth: PropTypes.number,
  onChange: PropTypes.func,
  onError: PropTypes.func,
  quality: PropTypes.number,
  style: PropTypes.object,
  value: PropTypes.string,
};

export default ImageUpload;

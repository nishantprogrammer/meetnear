import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../theme';
import PropTypes from 'prop-types';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Map = ({
  initialRegion,
  onLocationSelect,
  onError,
  style,
  showCurrentLocation = true,
  markerTitle,
  markerDescription,
}) => {
  const { colors, spacing, typography } = useTheme();
  const [region, setRegion] = useState(initialRegion);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showCurrentLocation) {
      getCurrentLocation();
    }
  }, [showCurrentLocation]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        onError?.('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      handleLocationSelect(newRegion);
    } catch (error) {
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = newRegion => {
    setRegion(newRegion);
  };

  const handleLocationSelect = location => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const handleMapPress = event => {
    const { coordinate } = event.nativeEvent;
    handleLocationSelect(coordinate);
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        showsUserLocation={showCurrentLocation}
        showsMyLocationButton={showCurrentLocation}
        showsCompass
        showsScale
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title={markerTitle}
            description={markerDescription}
          />
        )}
      </MapView>
      {showCurrentLocation && (
        <TouchableOpacity
          style={[
            styles.currentLocationButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <Icon name="my-location" size={24} color={colors.surface} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

Map.propTypes = {
  initialRegion: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    latitudeDelta: PropTypes.number,
    longitudeDelta: PropTypes.number,
  }),
  markerDescription: PropTypes.string,
  markerTitle: PropTypes.string,
  onError: PropTypes.func,
  onLocationSelect: PropTypes.func,
  showCurrentLocation: PropTypes.bool,
  style: PropTypes.object,
};

Map.defaultProps = {
  initialRegion: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
};

export default Map;

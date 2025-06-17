const { logger } = require('./logger');
const { ExternalServiceError } = require('./errors');
const axios = require('axios');

// Calculate distance between two points using Haversine formula
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lon - point1.lon);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Convert degrees to radians
const toRad = degrees => {
  return degrees * (Math.PI / 180);
};

// Get address from coordinates using Google Maps Geocoding API
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      return response.data.results[0].formatted_address;
    } else {
      throw new Error('Geocoding failed');
    }
  } catch (error) {
    logger.error('Error getting address from coordinates:', error);
    throw new ExternalServiceError('Failed to get address');
  }
};

// Get coordinates from address using Google Maps Geocoding API
const getCoordinatesFromAddress = async address => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      const { location } = response.data.results[0].geometry;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error('Geocoding failed');
    }
  } catch (error) {
    logger.error('Error getting coordinates from address:', error);
    throw new ExternalServiceError('Failed to get coordinates');
  }
};

// Find nearby places using Google Maps Places API
const findNearbyPlaces = async (lat, lng, radius, type) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      return response.data.results;
    } else {
      throw new Error('Places search failed');
    }
  } catch (error) {
    logger.error('Error finding nearby places:', error);
    throw new ExternalServiceError('Failed to find nearby places');
  }
};

// Calculate meeting point between two users
const calculateMeetingPoint = (user1Location, user2Location) => {
  try {
    // Calculate midpoint
    const midLat = (user1Location.lat + user2Location.lat) / 2;
    const midLng = (user1Location.lng + user2Location.lng) / 2;

    // Find nearby public places
    return findNearbyPlaces(midLat, midLng, 1000, 'establishment').then(places => {
      if (places.length > 0) {
        // Return the first place as meeting point
        return {
          lat: places[0].geometry.location.lat,
          lng: places[0].geometry.location.lng,
          name: places[0].name,
          address: places[0].vicinity,
          type: places[0].types[0],
        };
      } else {
        // If no places found, return midpoint
        return {
          lat: midLat,
          lng: midLng,
          name: 'Midpoint',
          address: 'No nearby places found',
          type: 'midpoint',
        };
      }
    });
  } catch (error) {
    logger.error('Error calculating meeting point:', error);
    throw new ExternalServiceError('Failed to calculate meeting point');
  }
};

// Get directions between two points using Google Maps Directions API
const getDirections = async (origin, destination, mode = 'driving') => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      return {
        distance: response.data.routes[0].legs[0].distance,
        duration: response.data.routes[0].legs[0].duration,
        steps: response.data.routes[0].legs[0].steps,
        polyline: response.data.routes[0].overview_polyline.points,
      };
    } else {
      throw new Error('Directions request failed');
    }
  } catch (error) {
    logger.error('Error getting directions:', error);
    throw new ExternalServiceError('Failed to get directions');
  }
};

// Check if a point is within a radius of another point
const isWithinRadius = (point1, point2, radius) => {
  const distance = calculateDistance(point1, point2);
  return distance <= radius;
};

// Get bounding box for a point and radius
const getBoundingBox = (lat, lng, radius) => {
  const R = 6371; // Earth's radius in kilometers
  const latRad = toRad(lat);
  const lngRad = toRad(lng);
  const radDist = radius / R;

  const minLat = latRad - radDist;
  const maxLat = latRad + radDist;
  let minLng, maxLng;

  if (minLat > -Math.PI / 2 && maxLat < Math.PI / 2) {
    const deltaLng = Math.asin(Math.sin(radDist) / Math.cos(latRad));
    minLng = lngRad - deltaLng;
    maxLng = lngRad + deltaLng;

    if (minLng < -Math.PI) minLng += 2 * Math.PI;
    if (maxLng > Math.PI) maxLng -= 2 * Math.PI;
  } else {
    minLat = Math.max(minLat, -Math.PI / 2);
    maxLat = Math.min(maxLat, Math.PI / 2);
    minLng = -Math.PI;
    maxLng = Math.PI;
  }

  return {
    minLat: minLat * (180 / Math.PI),
    maxLat: maxLat * (180 / Math.PI),
    minLng: minLng * (180 / Math.PI),
    maxLng: maxLng * (180 / Math.PI),
  };
};

module.exports = {
  calculateDistance,
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
  findNearbyPlaces,
  calculateMeetingPoint,
  getDirections,
  isWithinRadius,
  getBoundingBox,
};

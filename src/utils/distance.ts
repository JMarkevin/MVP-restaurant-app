import { calculateDistance } from '@/hooks/useGeolocation';

// Helper function to get distance for a restaurant
interface RestaurantWithDistance {
  distance?: number | string;
  dist?: number | string;
  distanceKm?: number | string;
  range?: number | string;
  distance_km?: number | string;
  distanceInKm?: number | string;
  distanceFromUser?: number | string;
  coordinates?: {
    lat?: number;
    long?: number;
  };
  latitude?: number;
  longitude?: number;
  lat?: number;
  longitude_coord?: number;
  latitude_coord?: number;
  [key: string]: unknown; // Allow dynamic property access
}

export function getRestaurantDistance(
  restaurant: RestaurantWithDistance,
  userLocation?: { latitude: number; longitude: number } | null
): number | null {
  // First, check if the API already provides distance (from /api/resto endpoint)
  // Only use API distance if it's a valid number > 0
  if (
    restaurant.distance !== undefined &&
    restaurant.distance !== null &&
    Number(restaurant.distance) > 0
  ) {
    return Number(restaurant.distance);
  }

  // Check for other possible distance field names as fallback
  const possibleDistanceFields = [
    'dist',
    'distanceKm',
    'range',
    'distance_km',
    'distanceInKm',
    'distanceFromUser',
  ];

  for (const field of possibleDistanceFields) {
    if (
      restaurant[field] !== undefined &&
      restaurant[field] !== null &&
      Number(restaurant[field]) > 0
    ) {
      return Number(restaurant[field]);
    }
  }

  // If we have coordinates for both restaurant and user, calculate distance
  // Check for coordinates in the API response structure
  const lat =
    restaurant.coordinates?.lat ||
    restaurant.latitude ||
    restaurant.lat ||
    restaurant.latitude_coord;
  const lng =
    restaurant.coordinates?.long ||
    restaurant.longitude ||
    restaurant.longitude_coord;

  if (lat && lng && userLocation?.latitude && userLocation?.longitude) {
    const calculatedDistance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      lat,
      lng
    );
    return calculatedDistance;
  }

  // No distance data available
  return null;
}

// Helper function to format distance for display
export function formatDistance(distance: number | null): string {
  if (distance === null || distance === undefined) {
    return 'N/A';
  }
  return `${distance.toFixed(1)} km`;
}

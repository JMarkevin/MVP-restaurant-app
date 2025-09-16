import { apiClient } from './axios';
import type { Restaurant, MenuItem, ApiResponse } from '@/types';

export const restaurantsApi = {
  getRestaurants: async (params?: {
    location?: string;
    range?: number;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    page?: number;
    limit?: number;
  }): Promise<Restaurant[]> => {
    const response = await apiClient.get<
      ApiResponse<{ restaurants: Restaurant[] }>
    >('/api/resto', { params });

    const restaurants = response.data.data.restaurants;

    // Check if restaurants have coordinates or distance data
    const hasCoordinates = restaurants.some((r) => r.coordinates || r.latitude);
    const hasDistance = restaurants.some((r) => r.distance && r.distance > 0);

    // If no coordinates or distance data, fetch them efficiently
    if (!hasCoordinates && !hasDistance && restaurants.length > 0) {
      // Fetch coordinates for restaurants in batches to avoid N+1 queries
      const batchSize = 5; // Process 5 restaurants at a time
      const restaurantsWithCoordinates = [];

      for (let i = 0; i < restaurants.length; i += batchSize) {
        const batch = restaurants.slice(i, i + batchSize);
        const batchPromises = batch.map(async (restaurant) => {
          try {
            const detailResponse = await apiClient.get(
              `/api/resto/${restaurant.id}`
            );
            if (
              detailResponse.data.success &&
              detailResponse.data.data.coordinates
            ) {
              return {
                ...restaurant,
                coordinates: detailResponse.data.data.coordinates,
              };
            }
          } catch {
            // Silently handle coordinate fetching errors
          }
          return restaurant;
        });

        const batchResults = await Promise.all(batchPromises);
        restaurantsWithCoordinates.push(...batchResults);
      }

      return restaurantsWithCoordinates;
    }

    return restaurants;
  },

  getRecommendedRestaurants: async (
    page: number = 1,
    limit: number = 12
  ): Promise<{ restaurants: Restaurant[]; hasMore: boolean }> => {
    try {
      const response = await apiClient.get('/api/resto/recommended', {
        params: { page, limit },
      });

      // Handle different possible response structures
      if (response.data.success && response.data.data) {
        let restaurants: Restaurant[] = [];
        let hasMore = false;

        if (response.data.data.recommendations) {
          restaurants = response.data.data.recommendations;
        } else if (response.data.data.restaurants) {
          restaurants = response.data.data.restaurants;
        } else if (Array.isArray(response.data.data)) {
          restaurants = response.data.data;
        }

        // Check if there are more pages
        if (response.data.data.pagination) {
          hasMore =
            response.data.data.pagination.page <
            response.data.data.pagination.totalPages;
        } else {
          // If no pagination info, assume hasMore based on returned count
          hasMore = restaurants.length === limit;
        }

        // Return restaurants as-is without fetching coordinates individually
        return { restaurants, hasMore };
      }

      // If we get here, the response structure is unexpected
      return { restaurants: [], hasMore: false };
    } catch {
      // Fallback to regular restaurants endpoint
      const fallbackResponse = await apiClient.get('/api/resto', {
        params: { page, limit },
      });

      let restaurants: Restaurant[] = [];
      let hasMore = false;

      if (fallbackResponse.data.success && fallbackResponse.data.data) {
        if (fallbackResponse.data.data.restaurants) {
          restaurants = fallbackResponse.data.data.restaurants;
        } else if (Array.isArray(fallbackResponse.data.data)) {
          restaurants = fallbackResponse.data.data;
        }

        // Check pagination
        if (fallbackResponse.data.data.pagination) {
          hasMore =
            fallbackResponse.data.data.pagination.page <
            fallbackResponse.data.data.pagination.totalPages;
        } else {
          hasMore = restaurants.length === limit;
        }
      }

      // Check if restaurants have coordinates or distance data
      const hasCoordinates = restaurants.some(
        (r) => r.coordinates || r.latitude
      );
      const hasDistance = restaurants.some((r) => r.distance && r.distance > 0);

      // If no coordinates or distance data, fetch them efficiently
      if (!hasCoordinates && !hasDistance && restaurants.length > 0) {
        // Fetch coordinates for restaurants in batches to avoid N+1 queries
        const batchSize = 5; // Process 5 restaurants at a time
        const restaurantsWithCoordinates = [];

        for (let i = 0; i < restaurants.length; i += batchSize) {
          const batch = restaurants.slice(i, i + batchSize);
          const batchPromises = batch.map(async (restaurant) => {
            try {
              const detailResponse = await apiClient.get(
                `/api/resto/${restaurant.id}`
              );
              if (
                detailResponse.data.success &&
                detailResponse.data.data.coordinates
              ) {
                return {
                  ...restaurant,
                  coordinates: detailResponse.data.data.coordinates,
                };
              }
            } catch {
              // Silently handle coordinate fetching errors
            }
            return restaurant;
          });

          const batchResults = await Promise.all(batchPromises);
          restaurantsWithCoordinates.push(...batchResults);
        }

        return { restaurants: restaurantsWithCoordinates, hasMore };
      }

      return { restaurants, hasMore };
    }
  },

  getRestaurantById: async (id: string): Promise<Restaurant> => {
    const response = await apiClient.get<ApiResponse<Restaurant>>(
      `/api/resto/${id}`
    );
    return response.data.data;
  },

  getRestaurantMenus: async (restaurantId: string): Promise<MenuItem[]> => {
    try {
      // Try to get menus from the restaurant detail endpoint first
      const restaurant = await restaurantsApi.getRestaurantById(restaurantId);
      if (restaurant.menus && restaurant.menus.length > 0) {
        return restaurant.menus;
      }

      // If no menus in restaurant object, try dedicated menu endpoint
      const response = await apiClient.get<ApiResponse<MenuItem[]>>(
        `/api/resto/${restaurantId}/menu`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      // Fallback: return empty array
      return [];
    } catch {
      return [];
    }
  },
};

import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '@/services/api/restaurants';
import { reviewsApi } from '@/services/api/reviews';

export function useRestaurantsQuery(params?: {
  location?: string;
  range?: number;
  price?: string;
  rating?: number;
}) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => restaurantsApi.getRestaurants(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    retry: false, // Don't retry on failure to prevent loops
  });
}

export function useRestaurantQuery(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantsApi.getRestaurantById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
  });
}

export function useRestaurantMenusQuery(restaurantId: string) {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'menus'],
    queryFn: () => restaurantsApi.getRestaurantMenus(restaurantId),
    enabled: !!restaurantId,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
  });
}

export function useRestaurantReviewsQuery(restaurantId: string) {
  return useQuery({
    queryKey: ['restaurant-reviews', Number(restaurantId)],
    queryFn: () => reviewsApi.getRestaurantReviews(Number(restaurantId)),
    enabled: !!restaurantId,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
  });
}

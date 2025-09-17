import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/services/api/reviews';
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
} from '@/services/api/reviews';

// Get reviews for a specific restaurant
export function useRestaurantReviewsQuery(
  restaurantId: number,
  params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }
) {
  return useQuery({
    queryKey: ['restaurant-reviews', restaurantId, params],
    queryFn: () => reviewsApi.getRestaurantReviews(restaurantId, params),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get current user's reviews
export function useMyReviewsQuery(
  params?: { page?: number; limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['my-reviews', params],
    queryFn: () => reviewsApi.getMyReviews(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false, // Default to true unless explicitly disabled
  });
}

// Create a new review
export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => {
      return reviewsApi.createReview(data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch restaurant reviews
      queryClient.invalidateQueries({
        queryKey: ['restaurant-reviews', variables.restaurantId],
      });
      // Invalidate and refetch my reviews
      queryClient.invalidateQueries({
        queryKey: ['my-reviews'],
      });
      // Invalidate restaurant details to update rating
      queryClient.invalidateQueries({
        queryKey: ['restaurant', variables.restaurantId],
      });
    },
  });
}

// Update a review
export function useUpdateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: UpdateReviewRequest;
    }) => reviewsApi.updateReview(reviewId, data),
    onSuccess: () => {
      // Invalidate and refetch my reviews
      queryClient.invalidateQueries({
        queryKey: ['my-reviews'],
      });
      // Invalidate all restaurant reviews
      queryClient.invalidateQueries({
        queryKey: ['restaurant-reviews'],
      });
      // Invalidate all restaurant details
      queryClient.invalidateQueries({
        queryKey: ['restaurant'],
      });
    },
  });
}

// Delete a review
export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      // Invalidate and refetch my reviews
      queryClient.invalidateQueries({
        queryKey: ['my-reviews'],
      });
      // Invalidate all restaurant reviews (we don't know which restaurant)
      queryClient.invalidateQueries({
        queryKey: ['restaurant-reviews'],
      });
      // Invalidate all restaurant details
      queryClient.invalidateQueries({
        queryKey: ['restaurant'],
      });
    },
  });
}

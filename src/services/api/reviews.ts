import { apiClient } from './axios';
import type { ApiResponse } from '@/types';

export interface CreateReviewRequest {
  transactionId: string;
  restaurantId: number;
  star: number;
  comment: string;
}

export interface UpdateReviewRequest {
  star: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  star: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: number;
    name: string;
  };
  restaurant?: {
    id: number;
    name: string;
    logo?: string;
  };
}

export interface RestaurantReviewsResponse {
  restaurant: {
    id: number;
    name: string;
    star: number;
  };
  reviews: ReviewResponse[];
  statistics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MyReviewsResponse {
  reviews: ReviewResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewsApi = {
  // Create a new review for a restaurant
  createReview: async (data: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await apiClient.post<
      ApiResponse<{ review: ReviewResponse }>
    >('/api/review', data);
    return response.data.data.review;
  },

  // Get reviews for a specific restaurant
  getRestaurantReviews: async (
    restaurantId: number,
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
    }
  ): Promise<RestaurantReviewsResponse> => {
    try {
      const response = await apiClient.get<
        ApiResponse<RestaurantReviewsResponse>
      >(`/api/review/restaurant/${restaurantId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Review API - Error fetching reviews:', error);
      throw error;
    }
  },

  // Get current user's reviews
  getMyReviews: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<MyReviewsResponse> => {
    const response = await apiClient.get<ApiResponse<MyReviewsResponse>>(
      '/api/review/my-reviews',
      { params }
    );
    return response.data.data;
  },

  // Update a review
  updateReview: async (
    reviewId: number,
    data: UpdateReviewRequest
  ): Promise<ReviewResponse> => {
    const response = await apiClient.put<
      ApiResponse<{ review: ReviewResponse }>
    >(`/api/review/${reviewId}`, data);
    return response.data.data.review;
  },

  // Delete a review
  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/api/review/${reviewId}`);
  },
};

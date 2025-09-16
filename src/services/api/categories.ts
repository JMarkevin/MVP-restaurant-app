import { apiClient } from './axios';
import type { Category, ApiResponse } from '@/types';

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      // Try to fetch from a categories endpoint first
      const response = await apiClient.get<ApiResponse<Category[]>>(
        '/api/categories'
      );
      return response.data.data;
    } catch {
      // Fallback to predefined categories if API doesn't exist
      return [
        {
          id: 'all',
          name: 'All Restaurant',
          icon: '/src/assets/logos/allrestaurant-logo.png',
          filter: null,
        },
        {
          id: 'nearby',
          name: 'Nearby',
          icon: '/src/assets/logos/location-logo.png',
          filter: 'nearby',
        },
        {
          id: 'discount',
          name: 'Discount',
          icon: '/src/assets/logos/discount-logo.png',
          filter: 'discount',
        },
        {
          id: 'bestseller',
          name: 'Best Seller',
          icon: '/src/assets/logos/bestseller-logo.png',
          filter: 'bestseller',
        },
        {
          id: 'delivery',
          name: 'Delivery',
          icon: '/src/assets/logos/delivery-logo.png',
          filter: 'delivery',
        },
        {
          id: 'lunch',
          name: 'Lunch',
          icon: '/src/assets/logos/lunch-logo.png',
          filter: 'lunch',
        },
      ];
    }
  },
};

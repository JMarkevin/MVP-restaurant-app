import { apiClient } from './axios';
import type { Category, ApiResponse } from '@/types';
import allRestaurantLogo from '/allrestaurant-logo.png';
import locationLogo from '/location-logo.png';
import discountLogo from '/discount-logo.png';
import bestsellerLogo from '/bestseller-logo.png';
import deliveryLogo from '/delivery-logo.png';
import lunchLogo from '/lunch-logo.png';

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
          icon: allRestaurantLogo,
          filter: null,
        },
        {
          id: 'nearby',
          name: 'Nearby',
          icon: locationLogo,
          filter: 'nearby',
        },
        {
          id: 'discount',
          name: 'Discount',
          icon: discountLogo,
          filter: 'discount',
        },
        {
          id: 'bestseller',
          name: 'Best Seller',
          icon: bestsellerLogo,
          filter: 'bestseller',
        },
        {
          id: 'delivery',
          name: 'Delivery',
          icon: deliveryLogo,
          filter: 'delivery',
        },
        {
          id: 'lunch',
          name: 'Lunch',
          icon: lunchLogo,
          filter: 'lunch',
        },
      ];
    }
  },
};

import type { Category } from '@/types';
import allRestaurantLogo from '/allrestaurant-logo.png';
import locationLogo from '/location-logo.png';
import discountLogo from '/discount-logo.png';
import bestsellerLogo from '/bestseller-logo.png';
import deliveryLogo from '/delivery-logo.png';
import lunchLogo from '/lunch-logo.png';

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    // Use predefined categories since the API doesn't have a categories endpoint
    // This avoids the 404 error in console while maintaining the same functionality
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

    // Note: If the API adds a categories endpoint in the future, uncomment this:
    // try {
    //   const response = await apiClient.get<ApiResponse<Category[]>>('/api/categories');
    //   return response.data.data;
    // } catch {
    //   // Return predefined categories as fallback
    //   return [...]; // categories array above
    // }
  },
};

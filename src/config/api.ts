// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://berestaurantappformentee-production.up.railway.app';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',

    // Restaurant endpoints
    RESTAURANTS: '/api/resto',
    RESTAURANT_DETAIL: (id: number) => `/api/resto/${id}`,
    RECOMMENDED_RESTAURANTS: '/api/resto/recommended',

    // Cart endpoints
    CART: '/api/cart',
    CART_ITEM: (id: number) => `/api/cart/${id}`,

    // Order endpoints
    CHECKOUT: '/api/order/checkout',
    MY_ORDERS: '/api/order/my-order',
    UPDATE_ORDER_STATUS: (id: number) => `/api/order/${id}/status`,

    // Review endpoints
    REVIEWS: '/api/review',
    RESTAURANT_REVIEWS: (restaurantId: number) =>
      `/api/review/restaurant/${restaurantId}`,
    MY_REVIEWS: '/api/review/my-reviews',
    UPDATE_REVIEW: (id: number) => `/api/review/${id}`,
    DELETE_REVIEW: (id: number) => `/api/review/${id}`,
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

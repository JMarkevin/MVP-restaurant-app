import { apiClient } from './axios';

// API Response Types
interface CartItemResponse {
  id: number;
  restaurant: {
    id: number;
    name: string;
    logo: string;
  };
  menu: {
    id: number;
    foodName: string;
    price: number;
    type: string;
    image: string;
  };
  quantity: number;
  itemTotal: number;
}

interface CartResponse {
  success: boolean;
  data: {
    cart: Array<{
      restaurant: {
        id: number;
        name: string;
        logo: string;
      };
      items: CartItemResponse[];
      subtotal: number;
    }>;
    summary: {
      totalItems: number;
      totalPrice: number;
      restaurantCount: number;
    };
  };
}

interface AddToCartResponse {
  success: boolean;
  message: string;
  data: {
    cartItem: CartItemResponse;
  };
}

interface UpdateCartResponse {
  success: boolean;
  data: {
    cartItem: CartItemResponse;
  };
}

interface ClearCartResponse {
  success: boolean;
  message: string;
}

export const cartApi = {
  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get('/api/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (item: {
    restaurantId: number;
    menuId: number;
    quantity: number;
  }): Promise<AddToCartResponse> => {
    const response = await apiClient.post('/api/cart', item);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (
    id: number,
    quantity: number
  ): Promise<UpdateCartResponse> => {
    const response = await apiClient.put(`/api/cart/${id}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (id: number): Promise<ClearCartResponse> => {
    const response = await apiClient.delete(`/api/cart/${id}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<ClearCartResponse> => {
    const response = await apiClient.delete('/api/cart');
    return response.data;
  },
};

import { apiClient } from './axios';

// API Response Types
interface ApiOrderResponse {
  success: boolean;
  data: {
    orders: Array<{
      id: number;
      transactionId: string;
      status: 'preparing' | 'on_the_way' | 'delivered' | 'done' | 'cancelled';
      paymentMethod: string;
      pricing: {
        subtotal: number;
        serviceFee: number;
        deliveryFee: number;
        totalPrice: number;
      };
      restaurants: Array<{
        restaurantId: number;
        restaurantName: string;
        items: Array<{
          menuId: number;
          menuName: string;
          price: number;
          quantity: number;
          itemTotal: number;
        }>;
        subtotal: number;
      }>;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filter: {
      status: string;
    };
  };
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    transaction: {
      id: number;
      transactionId: string;
      paymentMethod: string;
      status: 'preparing' | 'on_the_way' | 'delivered' | 'done' | 'cancelled';
      pricing: {
        subtotal: number;
        serviceFee: number;
        deliveryFee: number;
        totalPrice: number;
      };
      restaurants: Array<{
        restaurant: {
          id: number;
          name: string;
          logo: string;
        };
        items: Array<{
          menuId: number;
          menuName: string;
          price: number;
          quantity: number;
          itemTotal: number;
        }>;
        subtotal: number;
      }>;
      createdAt: string;
    };
  };
}

export const ordersApi = {
  createOrder: async (orderData: {
    paymentMethod: string;
    deliveryAddress: string;
    notes?: string;
  }): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>(
      '/api/order/checkout',
      orderData
    );
    return response.data;
  },

  getMyOrders: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiOrderResponse> => {
    const params: { page: number; limit: number; status?: string } = {
      page,
      limit,
    };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get<ApiOrderResponse>(
      '/api/order/my-order',
      { params }
    );
    return response.data;
  },

  updateOrderStatus: async (
    id: number,
    status: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(`/api/order/${id}/status`, { status });
    return response.data;
  },
};

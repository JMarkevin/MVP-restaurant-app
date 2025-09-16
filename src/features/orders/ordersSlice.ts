import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'delivered'
    | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
}

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Add a new order
    addOrder: (
      state,
      action: PayloadAction<Omit<Order, 'id' | 'orderNumber' | 'orderDate'>>
    ) => {
      const newOrder: Order = {
        ...action.payload,
        id: Date.now().toString(),
        orderNumber: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
      };
      state.orders.unshift(newOrder);
      state.currentOrder = newOrder;
    },

    // Update order status
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: Order['status'] }>
    ) => {
      const order = state.orders.find(
        (order) => order.id === action.payload.id
      );
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder.status = action.payload.status;
      }
    },

    // Set current order
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
});

export const {
  addOrder,
  updateOrderStatus,
  setCurrentOrder,
  setLoading,
  setError,
  clearCurrentOrder,
} = ordersSlice.actions;

export default ordersSlice.reducer;

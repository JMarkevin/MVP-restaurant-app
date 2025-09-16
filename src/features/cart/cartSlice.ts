import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartState } from '@/types';

// Helper function to calculate total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Helper function to check if cart should be cleared (after midnight)
const shouldClearCart = (): boolean => {
  const now = new Date();
  const lastClearTime = localStorage.getItem('cartLastClearTime');

  if (!lastClearTime) {
    // First time, set current time and don't clear
    localStorage.setItem('cartLastClearTime', now.toISOString());
    return false;
  }

  const lastClear = new Date(lastClearTime);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastClearDate = new Date(
    lastClear.getFullYear(),
    lastClear.getMonth(),
    lastClear.getDate()
  );

  // If it's a new day, clear the cart and update the clear time
  if (today > lastClearDate) {
    localStorage.setItem('cartLastClearTime', now.toISOString());
    return true;
  }

  return false;
};

// Helper function to load cart from localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);

      // Check if cart should be cleared due to new day
      if (shouldClearCart()) {
        localStorage.removeItem('cart');
        return { items: [], total: 0 };
      }

      return {
        items: cartData.items || [],
        total: cartData.total || 0,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }

  return { items: [], total: 0 };
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cart: CartState): void => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState: CartState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.total = calculateTotal(action.payload);
      saveCartToStorage(state);
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.menuItemId === action.payload.menuItemId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = calculateTotal(state.items);
      saveCartToStorage(state);
    },
    addItem: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        price: number;
        image?: string;
        restaurantId: string;
        restaurantName: string;
      }>
    ) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id: action.payload.id,
          menuItemId: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: 1,
          imageUrl: action.payload.image,
          restaurantId: action.payload.restaurantId,
          restaurantName: action.payload.restaurantName,
        });
      }
      state.total = calculateTotal(state.items);
      saveCartToStorage(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        state.total = calculateTotal(state.items);
        saveCartToStorage(state);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = calculateTotal(state.items);
      saveCartToStorage(state);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = calculateTotal(state.items);
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      saveCartToStorage(state);
    },
  },
});

export const {
  setCartItems,
  addToCart,
  addItem,
  updateQuantity,
  removeFromCart,
  removeItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FilterState } from '@/types';

const initialState: FilterState = {
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'name',
  sortOrder: 'asc',
  priceRange: {
    min: 0,
    max: 1000,
  },
  location: undefined,
  // CategoryPage specific filters
  distance: [],
  priceMin: '',
  priceMax: '',
  rating: [],
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'name' | 'price' | 'rating'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setPriceRange: (
      state,
      action: PayloadAction<{ min: number; max: number }>
    ) => {
      state.priceRange = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
    // CategoryPage specific filter actions
    setDistance: (state, action: PayloadAction<string[]>) => {
      state.distance = action.payload;
    },
    toggleDistance: (state, action: PayloadAction<string>) => {
      const distance = action.payload;
      if (state.distance.includes(distance)) {
        state.distance = state.distance.filter((d) => d !== distance);
      } else {
        state.distance.push(distance);
      }
    },
    setPriceMin: (state, action: PayloadAction<string>) => {
      state.priceMin = action.payload;
    },
    setPriceMax: (state, action: PayloadAction<string>) => {
      state.priceMax = action.payload;
    },
    setRating: (state, action: PayloadAction<string[]>) => {
      state.rating = action.payload;
    },
    toggleRating: (state, action: PayloadAction<string>) => {
      const rating = action.payload;
      if (state.rating.includes(rating)) {
        state.rating = state.rating.filter((r) => r !== rating);
      } else {
        state.rating.push(rating);
      }
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = '';
      state.sortBy = 'name';
      state.sortOrder = 'asc';
      state.priceRange = { min: 0, max: 1000 };
      state.location = undefined;
      state.distance = [];
      state.priceMin = '';
      state.priceMax = '';
      state.rating = [];
    },
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  setPriceRange,
  setLocation,
  setDistance,
  toggleDistance,
  setPriceMin,
  setPriceMax,
  setRating,
  toggleRating,
  clearFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

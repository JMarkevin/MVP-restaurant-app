export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
};

export type Restaurant = {
  id: number;
  name: string;
  star: number; // API uses 'star' instead of 'rating'
  place: string; // API uses 'place' instead of 'location'
  logo: string; // API uses 'logo' instead of 'image'
  images: string[]; // API provides array of images
  reviewCount: number;
  menuCount: number;
  priceRange: {
    min: number;
    max: number;
  };
  distance?: number; // API may provide distance as number
  // Coordinates from API response structure
  coordinates?: {
    lat: number;
    long: number;
  };
  // Legacy coordinates for backward compatibility
  latitude?: number;
  longitude?: number;
  // Legacy properties for backward compatibility
  description?: string;
  location?: string;
  rating?: number;
  imageUrl?: string;
  image?: string;
  cuisine?: string;
  deliveryTime?: string;
  menus?: MenuItem[];
  reviews?: Review[];
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
  filter?: string | null;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  imageUrl?: string;
  category: string;
  restaurantId: string;
  rating?: number;
  createdAt?: string;
};

export type CartItem = {
  id: string; // cart item id
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  restaurantId: string;
  restaurantName?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'delivered'
    | 'cancelled';
  createdAt: string;
  updatedAt: string;
  restaurantId: string;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type Review = {
  id: number;
  star: number; // API uses 'star' instead of 'rating'
  comment: string;
  createdAt: string;
  updatedAt?: string;
  userName?: string;
  user?: {
    id: number;
    name: string;
    profilePicture?: string;
    avatar?: string;
    image?: string;
  };
  restaurant?: {
    id: number;
    name: string;
    logo?: string;
  };
  // Legacy fields for backward compatibility
  userId?: string;
  restaurantId?: string;
  rating?: number; // For backward compatibility
};

export type FilterState = {
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'name' | 'price' | 'rating';
  sortOrder: 'asc' | 'desc';
  priceRange: {
    min: number;
    max: number;
  };
  location?: string;
  // CategoryPage specific filters
  distance: string[];
  priceMin: string;
  priceMax: string;
  rating: string[];
};

export type CartState = {
  items: CartItem[];
  total: number;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
  status: number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

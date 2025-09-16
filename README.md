# 🍽️ Foody - Restaurant Delivery App

A modern, responsive restaurant delivery application built with React, TypeScript, and Tailwind CSS. This app provides a complete food ordering experience with user authentication, restaurant browsing, cart management, and order processing.

## ✨ Features

### 🏠 **Homepage**

- **Hero Section**: Eye-catching banner with search functionality
- **Categories**: Browse food categories with interactive cards
- **Restaurant Recommendations**: Featured restaurants with ratings and details
- **Responsive Design**: Optimized for both desktop and mobile devices

### 🍕 **Restaurant Features**

- **Restaurant Detail Pages**: Comprehensive restaurant information
- **Menu Browsing**: Categorized menu items with images and pricing
- **Interactive Menu Cards**: Add/remove items with quantity controls
- **Image Gallery**: Slidable restaurant image carousel
- **Reviews Section**: Customer reviews and ratings

### 🛒 **Shopping Experience**

- **Shopping Cart**: Add items, adjust quantities, view totals
- **Cart Management**: Real-time cart updates with Redux state management
- **Checkout Process**: Complete order flow with payment options
- **Order History**: Track past orders and their status

### 👤 **User Management**

- **Authentication**: Login/signup with JWT token management
- **User Profile**: Manage personal information and addresses
- **Order Tracking**: View order history and status updates
- **Review System**: Rate and review restaurants and orders

### 📱 **Mobile Responsiveness**

- **Fully Responsive**: Optimized for all screen sizes
- **Mobile-First Design**: Tailored mobile experience
- **Touch-Friendly**: Intuitive mobile interactions
- **Progressive Web App**: Fast loading and offline capabilities

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client for API requests

### **UI Components**

- **Lucide React** - Beautiful icon library
- **Custom Components** - Reusable UI components
- **Responsive Design** - Mobile-first approach
- **Modern Styling** - Clean and intuitive interface

### **Development Tools**

- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Vite** - Fast development and building

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd restaurantapp/restaurant-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

## 📁 Project Structure

```
restaurant-frontend/
├── public/
│   └── assets/           # Static assets (images, logos)
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AuthModal.tsx
│   │   ├── CheckoutBar.tsx
│   │   ├── Footer.tsx
│   │   ├── MenuCard.tsx
│   │   ├── Navbar.tsx
│   │   ├── OrdersCard.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── RestaurantCard.tsx
│   │   └── ReviewModal.tsx
│   ├── pages/            # Main application pages
│   │   ├── CategoryPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── MyCartPage.tsx
│   │   ├── PaymentSuccessPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── RestaurantDetailPage.tsx
│   ├── features/         # Redux store slices
│   │   ├── cart/
│   │   └── orders/
│   ├── services/         # API services
│   │   └── api/
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Design System

### **Color Palette**

- **Primary Red**: `#C12116` - Main brand color
- **Dark Text**: `#0A0D12` - Primary text color
- **Light Gray**: `#F5F5F5` - Background and decorative elements
- **Border Gray**: `#D5D7DA` - Borders and dividers
- **Success Green**: `#44AB09` - Success states

### **Typography**

- **Font Family**: Nunito - Clean and modern sans-serif
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### **Spacing System**

- **Mobile-First**: Responsive design with Tailwind breakpoints
- **Consistent Spacing**: 4px base unit system
- **Component Spacing**: Harmonious spacing between elements

## 📱 Responsive Design

### **Breakpoints**

- **Mobile**: `< 768px` - Optimized for phones
- **Tablet**: `768px - 1024px` - Medium screens
- **Desktop**: `> 1024px` - Large screens

### **Mobile Features**

- **Touch-Friendly**: Large tap targets and gestures
- **Swipe Navigation**: Image galleries and carousels
- **Collapsible Menus**: Space-efficient navigation
- **Optimized Forms**: Mobile-friendly input fields

## 🔧 Key Components

### **Navigation**

- **Navbar**: Main navigation with logo, search, and user menu
- **Mobile Profile Sidebar**: Slide-out profile navigation
- **Footer**: Links and company information

### **Content Pages**

- **HomePage**: Landing page with hero, categories, and restaurants
- **CategoryPage**: Filtered restaurant listings
- **RestaurantDetailPage**: Detailed restaurant view with menu
- **MyCartPage**: Shopping cart management
- **CheckoutPage**: Order completion and payment
- **ProfilePage**: User account management

### **Interactive Elements**

- **AuthModal**: Login and registration forms
- **ReviewModal**: Rating and review submission
- **CheckoutBar**: Persistent cart summary
- **MenuCard**: Interactive menu item cards

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized images and lazy loading
- **State Management**: Efficient Redux state updates
- **API Caching**: TanStack Query for data caching
- **Bundle Optimization**: Vite's optimized build process

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Form validation and sanitization
- **CORS Handling**: Proper cross-origin request handling
- **Error Boundaries**: Graceful error handling

## 🧪 Development Guidelines

### **Code Style**

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting
- **Component Structure**: Functional components with hooks

### **Best Practices**

- **Responsive Design**: Mobile-first approach
- **Component Reusability**: DRY principle implementation
- **State Management**: Centralized Redux store
- **API Integration**: Consistent error handling

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

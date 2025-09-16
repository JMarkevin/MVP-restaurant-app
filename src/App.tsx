import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { store } from '@/app/store';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';
import CheckoutPage from '@/pages/CheckoutPage';
import HomePage from '@/pages/HomePage';
import RestaurantDetailPage from '@/pages/RestaurantDetailPage';
import CategoryPage from '@/pages/CategoryPage';
import MyCartPage from '@/pages/MyCartPage';
import ProfilePage from '@/pages/ProfilePage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased default cache time
      gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
      retry: 1,
      refetchOnWindowFocus: false, // Disable refetch on window focus for better performance
    },
  },
});

// Main App Content
const AppContent = () => {
  return (
    <Routes>
      <Route path='/success' element={<PaymentSuccessPage />} />
      <Route
        path='*'
        element={
          <>
            <Navbar />
            <div
              className='min-h-screen bg-gray-50'
              style={{ overflow: 'visible' }}
            >
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route
                  path='/restaurants/:id'
                  element={<RestaurantDetailPage />}
                />
                <Route
                  path='/category'
                  element={<Navigate to='/category/all' replace />}
                />
                <Route path='/category/:category' element={<CategoryPage />} />
                <Route path='/cart' element={<MyCartPage />} />
                <Route path='/checkout' element={<CheckoutPage />} />
                <Route path='/profile' element={<ProfilePage />} />
              </Routes>
            </div>
          </>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

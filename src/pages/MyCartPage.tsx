import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { removeFromCart, updateQuantity } from '@/features/cart/cartSlice';
import { restaurantsApi } from '@/services/api/restaurants';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { RootState } from '@/app/store';
import type { CartItem, Restaurant } from '@/types';
import restaurantIcon from '/restaurant-icon.png';

const MyCartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Get unique restaurant IDs from cart items
  const restaurantIds = [
    ...new Set(cartItems.map((item) => item.restaurantId)),
  ];

  // Fetch restaurant data for all restaurants in cart
  const {
    data: restaurants = [],
    isLoading: restaurantsLoading,
    error: restaurantsError,
  } = useQuery({
    queryKey: ['restaurants', restaurantIds],
    queryFn: async () => {
      const restaurantPromises = restaurantIds.map((id) =>
        restaurantsApi.getRestaurantById(id).catch(() => null)
      );
      const results = await Promise.all(restaurantPromises);
      return results.filter(Boolean) as Restaurant[];
    },
    enabled: restaurantIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Create a map of restaurant ID to restaurant data
  const restaurantMap = restaurants.reduce((acc, restaurant) => {
    acc[restaurant.id.toString()] = restaurant;
    return acc;
  }, {} as Record<string, Restaurant>);

  // Group cart items by restaurant
  const groupedItems = cartItems.reduce(
    (acc, item) => {
      const restaurantId = item.restaurantId;
      const restaurant = restaurantMap[restaurantId];

      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurantId,
          restaurantName:
            restaurant?.name || item.restaurantName || 'Restaurant Name',
          restaurantLogo: restaurant?.logo,
          items: [],
          total: 0,
        };
      }
      acc[restaurantId].items.push(item);
      acc[restaurantId].total += item.price * item.quantity;
      return acc;
    },
    {} as Record<
      string,
      {
        restaurantId: string;
        restaurantName: string;
        restaurantLogo?: string;
        items: CartItem[];
        total: number;
      }
    >
  );

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Show loading state while fetching restaurant data
  if (restaurantsLoading && cartItems.length > 0) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className='max-w-4xl mx-auto px-8 py-16'>
          <div className='text-center'>
            <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>
              My Cart
            </h1>
            <div className='bg-white rounded-2xl shadow-lg p-16'>
              <div className='flex justify-center items-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
                <span className='ml-4 text-lg text-gray-600'>
                  Loading cart...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if restaurant data fails to load
  if (restaurantsError && cartItems.length > 0) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className='max-w-4xl mx-auto px-8 py-16'>
          <div className='text-center'>
            <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>
              My Cart
            </h1>
            <div className='bg-white rounded-2xl shadow-lg p-16'>
              <div className='text-red-600 text-lg mb-4'>
                Failed to load restaurant information
              </div>
              <button
                onClick={() => window.location.reload()}
                className='bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className='max-w-4xl mx-auto px-8 py-16'>
          <div className='text-center'>
            <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>
              My Cart
            </h1>
            <div className='bg-white rounded-2xl shadow-lg p-16'>
              <div className='text-gray-500 text-lg mb-4'>
                Your cart is empty
              </div>
              <div className='flex justify-center'>
                <button
                  onClick={() => navigate('/')}
                  className='bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
                >
                  Start Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20'>
      <div className='max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-16'>
        {/* Mobile: Frame 51 Layout */}
        <div className='md:hidden flex flex-col items-start px-0 gap-4 w-full max-w-[361px] mx-auto'>
          {/* My Cart Title */}
          <h1 className='font-nunito font-extrabold text-2xl leading-9 text-[#0A0D12] w-full'>
            My Cart
          </h1>

          {/* Mobile Cart Content - Frame 52 */}
          <div className='flex flex-col items-start px-0 gap-5 w-full'>
            {Object.values(groupedItems).map((group) => (
              <div
                key={group.restaurantId}
                className='flex flex-col items-start p-4 gap-3 w-full bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'
              >
                {/* Restaurant Header - Frame 49 */}
                <div
                  className='flex flex-row items-center gap-2 w-full h-8 cursor-pointer'
                  onClick={() => navigate(`/restaurants/${group.restaurantId}`)}
                >
                  {/* Restaurant Logo - Rectangle */}
                  <div className='w-8 h-8 flex-shrink-0'>
                    <ImageWithFallback
                      src={restaurantIcon}
                      alt={group.restaurantName}
                      className='w-full h-full object-cover rounded'
                      fallbackText='R'
                    />
                  </div>

                  {/* Restaurant Name and Chevron Container */}
                  <div className='flex flex-row items-center gap-1 flex-1'>
                    {/* Restaurant Name - Burger King */}
                    <span className='font-nunito font-bold text-base leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                      {group.restaurantName}
                    </span>

                    {/* Chevron Right Icon */}
                    <div className='w-5 h-5 flex items-center justify-center flex-shrink-0'>
                      <ChevronDown className='w-5 h-5 text-[#0A0D12] transform rotate-[-90deg]' />
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                <div className='flex flex-col items-start px-0 gap-3 w-full'>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className='flex flex-row justify-between items-center w-full h-[74px]'
                    >
                      {/* Item Info - Frame 46 */}
                      <div className='flex flex-row items-center gap-4 flex-1'>
                        {/* Item Image - Rectangle 3 */}
                        <div className='w-16 h-16 rounded-xl flex-shrink-0'>
                          <ImageWithFallback
                            src={
                              item.imageUrl ||
                              '/src/assets/images/food-placeholder.jpg'
                            }
                            alt={item.name}
                            className='w-full h-full object-cover rounded-xl'
                            fallbackText='No Image'
                          />
                        </div>

                        {/* Item Details - Frame 12 */}
                        <div className='flex flex-col items-start flex-1 min-w-0'>
                          {/* Food Name */}
                          <div className='font-nunito font-medium text-sm leading-7 text-[#0A0D12] w-full truncate'>
                            {item.name}
                          </div>

                          {/* Price - Rp50.000 */}
                          <div className='font-nunito font-extrabold text-base leading-[30px] text-[#0A0D12]'>
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls - Frame 48 */}
                      <div className='flex flex-row justify-end items-center flex-shrink-0'>
                        {/* Quantity Controls - Frame 20 */}
                        <div className='flex flex-row items-center gap-3'>
                          {/* Minus Button - Frame 19 */}
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className='flex flex-row justify-center items-center p-1.5 w-7 h-7 border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors'
                          >
                            <Minus className='w-4 h-4 text-[#0A0D12]' />
                          </button>

                          {/* Quantity Number */}
                          <span className='font-nunito font-semibold text-sm leading-[30px] tracking-[-0.02em] text-[#0A0D12] min-w-[16px] text-center'>
                            {item.quantity}
                          </span>

                          {/* Plus Button - Frame 18 */}
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className='flex flex-row items-center p-1.5 w-7 h-7 bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors'
                          >
                            <Plus className='w-4 h-4 text-white' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Separator Line */}
                  <div className='w-full h-0 border-t border-dashed border-[#D5D7DA]'></div>

                  {/* Total and Checkout - Frame 50 */}
                  <div className='flex flex-col items-start gap-3 w-full'>
                    {/* Total Section - Frame 12 */}
                    <div className='flex flex-col items-start w-full'>
                      {/* Total Label */}
                      <div className='font-nunito font-medium text-sm leading-7 text-[#0A0D12] mb-1'>
                        Total
                      </div>

                      {/* Total Price - Rp100.000 */}
                      <div className='font-nunito font-extrabold text-lg leading-8 tracking-[-0.02em] text-[#0A0D12]'>
                        {formatPrice(group.total)}
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      className='flex flex-row justify-center items-center p-2 gap-2 w-full h-11 bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors'
                    >
                      <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#FDFDFD]'>
                        Checkout
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden md:block'>
          {/* Page Title */}
          <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>
            My Cart
          </h1>

          {/* Cart Items */}
          <div className='space-y-6'>
            {Object.values(groupedItems).map((group) => (
              <div
                key={group.restaurantId}
                className='bg-white rounded-2xl shadow-lg p-5'
              >
                {/* Restaurant Header */}
                <div
                  className='flex items-center gap-2 mb-5 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
                  onClick={() => navigate(`/restaurants/${group.restaurantId}`)}
                >
                  <img
                    src={restaurantIcon}
                    alt={group.restaurantName}
                    className='w-8 h-8 object-contain'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                         <div class="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                           <span class="text-white text-xs font-bold">R</span>
                         </div>
                       `;
                      }
                    }}
                  />
                  <h3 className='text-lg font-bold text-gray-900'>
                    {group.restaurantName}
                  </h3>
                  <ChevronRight className='w-6 h-6 text-gray-400' />
                </div>

                {/* Cart Items */}
                <div className='space-y-5'>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between'
                    >
                      {/* Item Info */}
                      <div className='flex items-center gap-4'>
                        <div className='w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center'>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className='w-full h-full object-cover'
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                  <div class="flex flex-col items-center justify-center text-gray-400">
                                    <svg class="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="text-xs font-medium">No Image</span>
                                  </div>
                                `;
                                }
                              }}
                            />
                          ) : (
                            <div className='flex flex-col items-center justify-center text-gray-400'>
                              <svg
                                className='w-8 h-8 mb-1'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                                  clipRule='evenodd'
                                />
                              </svg>
                              <span className='text-xs font-medium'>
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className='text-base font-medium text-gray-900 mb-1'>
                            {item.name}
                          </h4>
                          <p className='text-lg font-extrabold text-gray-900'>
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-4'>
                          {/* Minus Button */}
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className='w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors'
                          >
                            <Minus className='w-6 h-6 text-gray-900' />
                          </button>

                          {/* Quantity */}
                          <span className='text-lg font-semibold text-gray-900 w-8 text-center'>
                            {item.quantity}
                          </span>

                          {/* Plus Button */}
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className='w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors'
                          >
                            <Plus className='w-6 h-6 text-white' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Separator */}
                <div className='border-t border-dashed border-gray-300 my-5'></div>

                {/* Total and Checkout */}
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-base font-medium text-gray-900 mb-1'>
                      Total
                    </p>
                    <p className='text-xl font-extrabold text-gray-900'>
                      {formatPrice(group.total)}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className='bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
                  >
                    Checkout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyCartPage;

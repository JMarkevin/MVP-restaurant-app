import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearCart,
  updateQuantity,
  removeFromCart,
} from '@/features/cart/cartSlice';
import { addOrder } from '@/features/orders/ordersSlice';
import { authApi } from '@/services/api/auth';
import { ordersApi } from '@/services/api/orders';
import { cartApi } from '@/services/api/cart';
import Footer from '@/components/Footer';
import type { RootState } from '@/app/store';
import type { CartItem } from '@/types';
import locationLogo from '/location-logo.png';
import restaurantIcon from '/restaurant-icon.png';
import bniLogo from '/bni.svg';
import briLogo from '/bri.svg';
import bcaLogo from '/bca.svg';
import mandiriLogo from '/mandiri.svg';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Fetch user profile data for address
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
    select: (response) => {
      // Get address from localStorage
      const address =
        typeof window !== 'undefined'
          ? localStorage.getItem('userAddress') || ''
          : '';
      return {
        ...response.data,
        address: address,
      };
    },
  });

  // Group cart items by restaurant
  const groupedItems = cartItems.reduce(
    (acc, item) => {
      const restaurantId = item.restaurantId;
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurantId,
          restaurantName: item.restaurantName || 'Restaurant',
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
        items: CartItem[];
        total: number;
      }
    >
  );

  // Payment method state
  const [selectedPayment, setSelectedPayment] = useState('bni');

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = 10000;
  const serviceFee = 1000;
  const total = subtotal + deliveryFee + serviceFee;

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        // Remove item if quantity becomes 0 or negative
        dispatch(removeFromCart(itemId));
      } else {
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
      }
    }
  };

  // Map bank codes to full names
  const getPaymentMethodName = (code: string): string => {
    const paymentMethods: Record<string, string> = {
      bni: 'Bank Nasional Indonesia',
      bri: 'Bank Rakyat Indonesia',
      bca: 'Bank Central Asia',
      mandiri: 'Bank Mandiri',
    };
    return paymentMethods[code] || 'Bank Nasional Indonesia';
  };

  const handleCheckout = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to place an order');
        return;
      }

      // Validate required fields
      const deliveryAddress = userProfile?.address || '';
      if (!deliveryAddress.trim()) {
        alert('Please provide a delivery address before placing your order.');
        return;
      }

      // Sync cart items to server first
      try {
        // Clear existing cart on server first
        await cartApi.clearCart();

        // Add each item to server cart
        for (const item of cartItems) {
          const cartItemData = {
            restaurantId: parseInt(item.restaurantId),
            menuId: parseInt(item.id),
            quantity: item.quantity,
          };

          await cartApi.addToCart(cartItemData);
        }

        // Verify cart on server
        await cartApi.getCart();
      } catch (cartError) {
        // Silently handle cart sync errors - proceed with order creation
        console.warn(
          'Cart sync failed, proceeding with order creation:',
          cartError
        );
      }

      // Prepare order data for API
      const orderData = {
        items: cartItems,
        subtotal,
        deliveryFee,
        serviceFee,
        total: subtotal + deliveryFee + serviceFee,
        paymentMethod: getPaymentMethodName(selectedPayment),
        orderDate: new Date().toISOString(),
      };

      // Call API to create order
      const apiOrderData = {
        paymentMethod: getPaymentMethodName(selectedPayment),
        deliveryAddress: deliveryAddress,
        notes: '',
      };

      const response = await ordersApi.createOrder(apiOrderData);

      // Add order to Redux state for local display
      if (cartItems.length > 0 && response.success) {
        const firstItem = cartItems[0];
        dispatch(
          addOrder({
            restaurantId: firstItem.restaurantId,
            restaurantName: firstItem.restaurantName || 'Restaurant',
            items: cartItems.map((item) => ({
              id: item.id,
              menuItemId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              restaurantId: item.restaurantId,
              imageUrl: item.imageUrl,
            })),
            totalAmount: total,
            status: 'preparing', // API returns 'preparing' status
            deliveryAddress: userProfile?.address || '',
            customerName: userProfile?.name || 'Customer',
            customerPhone: userProfile?.phone || '',
            notes: '',
          })
        );
      }

      // Clear cart
      dispatch(clearCart());

      // Invalidate orders cache to ensure fresh data when user navigates to orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Navigate to success page with order data
      navigate('/success', { state: orderData });
    } catch (error) {
      console.error('Error creating order:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string; [key: string]: unknown };
            statusText?: string;
          };
        };

        if (axiosError.response?.status === 401) {
          alert('Authentication failed. Please log in again.');
          window.location.reload();
        } else if (axiosError.response?.status === 400) {
          const errorMessage =
            axiosError.response?.data?.message || 'Invalid request data';
          alert(`Bad Request: ${errorMessage}`);
        } else {
          alert('Failed to create order. Please try again.');
        }
      } else {
        alert('Failed to create order. Please try again.');
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className='max-w-6xl mx-auto px-8 py-16'>
          <div className='text-center'>
            <h1 className='text-4xl font-extrabold text-gray-900 mb-8'>
              Checkout
            </h1>
            <div className='bg-white rounded-2xl shadow-lg p-16'>
              <div className='text-gray-500 text-lg mb-4'>
                Your cart is empty
              </div>
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
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20'>
      <div className='max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-16'>
        {/* Page Title */}
        <h1 className='text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-8 font-nunito'>
          Checkout
        </h1>

        {/* Main Content */}
        <div className='flex flex-col md:flex-row gap-4 md:gap-5'>
          {/* Left Column - Order Details */}
          <div className='flex-1 space-y-4 md:space-y-5'>
            {/* Delivery Address Card */}
            <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 w-full'>
              <div className='flex flex-col gap-3 w-full'>
                {/* Header - Frame 61 */}
                <div className='flex flex-col items-start gap-1 w-full'>
                  {/* Frame 49 */}
                  <div className='flex flex-row items-center gap-2'>
                    {/* Rectangle - Location Icon */}
                    <div className='w-6 h-6 flex-shrink-0'>
                      <img
                        src={locationLogo}
                        alt='Location'
                        className='w-full h-full object-contain'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                            <div class="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                              <span class="text-white text-xs font-bold">L</span>
                            </div>
                          `;
                          }
                        }}
                      />
                    </div>
                    {/* Delivery Address Title */}
                    <h3 className='font-nunito font-extrabold text-base leading-[30px] text-[#0A0D12]'>
                      Delivery Address
                    </h3>
                  </div>

                  {/* Address Content */}
                  <div className='w-full'>
                    {isProfileLoading ? (
                      <div className='animate-pulse space-y-2'>
                        <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                      </div>
                    ) : userProfile?.address ? (
                      <div className='space-y-1'>
                        <p className='font-nunito font-medium text-sm leading-7 text-[#0A0D12]'>
                          {userProfile.address}
                        </p>
                        <p className='font-nunito font-medium text-sm leading-7 text-[#0A0D12]'>
                          {userProfile?.phone || 'No phone number provided'}
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <p className='font-nunito font-medium text-sm text-gray-500'>
                          No delivery address provided
                        </p>
                        <p className='font-nunito text-xs text-gray-400'>
                          Please add your address in your profile to continue
                          with checkout
                        </p>
                        <button
                          onClick={() => navigate('/profile')}
                          className='text-red-600 text-xs font-medium hover:text-red-700 underline'
                        >
                          Add Address in Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Button */}
                <button
                  className='flex flex-row justify-center items-center px-2 py-2 gap-2 w-[120px] h-9 border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors self-start'
                  onClick={() => navigate('/profile?tab=address')}
                >
                  <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12]'>
                    Change
                  </span>
                </button>
              </div>
            </div>

            {/* My Cart List */}
            <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 w-full'>
              {Object.values(groupedItems).map((group) => (
                <div
                  key={group.restaurantId}
                  className='flex flex-col gap-3 w-full'
                >
                  {/* Restaurant Header - Frame 118 */}
                  <div className='flex flex-row justify-between items-center w-full h-10'>
                    {/* Frame 49 */}
                    <div className='flex flex-row items-center gap-2'>
                      {/* Rectangle - Restaurant Logo */}
                      <div className='w-8 h-8 flex-shrink-0'>
                        <img
                          src={restaurantIcon}
                          alt={group.restaurantName}
                          className='w-full h-full object-cover rounded'
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
                      </div>
                      {/* Restaurant Name */}
                      <h3 className='font-nunito font-bold text-base leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                        {group.restaurantName}
                      </h3>
                    </div>

                    {/* Add Item Button */}
                    <button
                      className='flex flex-row justify-center items-center px-6 py-2 gap-2 h-9 border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors flex-shrink-0'
                      onClick={() =>
                        navigate(`/restaurants/${group.restaurantId}`)
                      }
                    >
                      <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12]'>
                        Add item
                      </span>
                    </button>
                  </div>

                  {/* Cart Items */}
                  <div className='flex flex-col gap-3 w-full'>
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className='flex flex-row items-center w-full h-[84px] gap-4'
                      >
                        {/* Item Image - Rectangle 3 */}
                        <div className='w-16 h-16 rounded-xl flex-shrink-0'>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className='w-full h-full object-cover rounded-xl'
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                                        <span class="text-gray-400 text-xs">No Image</span>
                                      </div>
                                    `;
                                }
                              }}
                            />
                          ) : (
                            <div className='w-full h-full bg-gray-200 rounded-xl flex items-center justify-center'>
                              <span className='text-gray-400 text-xs'>
                                No Image
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Item Details - Frame 12 */}
                        <div className='flex flex-col items-start flex-1 min-w-0'>
                          {/* Food Name */}
                          <div className='font-nunito font-medium text-sm leading-7 text-[#0A0D12] w-full truncate'>
                            {item.name}
                          </div>
                          {/* Price */}
                          <div className='font-nunito font-extrabold text-base leading-[30px] text-[#0A0D12]'>
                            {formatPrice(item.price)}
                          </div>
                        </div>

                        {/* Quantity Controls - Frame 48 */}
                        <div className='flex flex-row items-center gap-3 md:gap-4 flex-shrink-0'>
                          {/* Minus Button - Frame 19 */}
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className='flex flex-row justify-center items-center p-2 md:p-[6.5px] gap-1.5 md:gap-[6.5px] w-8 h-8 md:w-9 md:h-9 border border-[#D5D7DA] rounded-full hover:bg-gray-50 transition-colors touch-manipulation'
                            type='button'
                          >
                            <Minus className='w-4 h-4 md:w-[19.5px] md:h-[19.5px] text-[#0A0D12]' />
                          </button>

                          {/* Quantity Number */}
                          <span className='font-nunito font-semibold text-sm md:text-base leading-[30px] tracking-[-0.02em] text-[#0A0D12] min-w-[16px] md:min-w-[20px] text-center'>
                            {item.quantity}
                          </span>

                          {/* Plus Button - Frame 18 */}
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className='flex flex-row items-center p-2 md:p-[6.5px] gap-1.5 md:gap-[6.5px] w-8 h-8 md:w-9 md:h-9 bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors touch-manipulation'
                            type='button'
                          >
                            <Plus className='w-4 h-4 md:w-[19.5px] md:h-[19.5px] text-white' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className='w-full md:w-96'>
            {/* Combined Payment Method & Summary Card */}
            <div className='relative bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] w-full'>
              {/* Decorative Ellipses */}
              <div
                className='absolute w-5 h-5 bg-gray-100 rounded-full -left-2.5'
                style={{ top: '51%', zIndex: 3 }}
              ></div>
              <div
                className='absolute w-5 h-5 bg-gray-100 rounded-full -right-2.5'
                style={{ top: '51%', zIndex: 3 }}
              ></div>

              <div className='flex flex-col items-end py-4 gap-4 w-full'>
                {/* Payment Method Section */}
                <div className='flex flex-col items-start px-4 w-full'>
                  <h3 className='font-nunito font-extrabold text-base leading-[30px] text-[#0A0D12] w-full mb-4'>
                    Payment Method
                  </h3>

                  {/* Payment Options */}
                  <div className='flex flex-col space-y-3 w-full'>
                    {/* BNI */}
                    <div
                      className='flex items-center gap-3 cursor-pointer w-full h-10 p-2 rounded-lg hover:bg-gray-50 transition-colors'
                      onClick={() => setSelectedPayment('bni')}
                    >
                      <div className='w-10 h-10 border border-[#D5D7DA] rounded-lg flex items-center justify-center p-2 flex-shrink-0'>
                        <img
                          src={bniLogo}
                          alt='BNI'
                          className='w-full h-full object-contain'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                 <span class="text-xs font-bold text-red-600">BNI</span>
                               `;
                            }
                          }}
                        />
                      </div>
                      <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1'>
                        Bank Negara Indonesia
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === 'bni'
                            ? 'bg-[#C12116]'
                            : 'border-2 border-[#A4A7AE]'
                        }`}
                      >
                        {selectedPayment === 'bni' && (
                          <div className='w-2 h-2 bg-white rounded-full'></div>
                        )}
                      </div>
                    </div>

                    <div className='w-full h-px bg-[#E9EAEB]'></div>

                    {/* BRI */}
                    <div
                      className='flex items-center gap-3 cursor-pointer w-full h-10 p-2 rounded-lg hover:bg-gray-50 transition-colors'
                      onClick={() => setSelectedPayment('bri')}
                    >
                      <div className='w-10 h-10 border border-[#D5D7DA] rounded-lg flex items-center justify-center p-2 flex-shrink-0'>
                        <img
                          src={briLogo}
                          alt='BRI'
                          className='w-full h-full object-contain'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                 <span class="text-xs font-bold text-blue-600">BRI</span>
                               `;
                            }
                          }}
                        />
                      </div>
                      <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1'>
                        Bank Rakyat Indonesia
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === 'bri'
                            ? 'bg-[#C12116]'
                            : 'border-2 border-[#A4A7AE]'
                        }`}
                      >
                        {selectedPayment === 'bri' && (
                          <div className='w-2 h-2 bg-white rounded-full'></div>
                        )}
                      </div>
                    </div>

                    <div className='w-full h-px bg-[#E9EAEB]'></div>

                    {/* BCA */}
                    <div
                      className='flex items-center gap-3 cursor-pointer w-full h-10 p-2 rounded-lg hover:bg-gray-50 transition-colors'
                      onClick={() => setSelectedPayment('bca')}
                    >
                      <div className='w-10 h-10 border border-[#D5D7DA] rounded-lg flex items-center justify-center p-2 flex-shrink-0'>
                        <img
                          src={bcaLogo}
                          alt='BCA'
                          className='w-full h-full object-contain'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                 <span class="text-xs font-bold text-blue-600">BCA</span>
                               `;
                            }
                          }}
                        />
                      </div>
                      <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1'>
                        Bank Central Asia
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === 'bca'
                            ? 'bg-[#C12116]'
                            : 'border-2 border-[#A4A7AE]'
                        }`}
                      >
                        {selectedPayment === 'bca' && (
                          <div className='w-2 h-2 bg-white rounded-full'></div>
                        )}
                      </div>
                    </div>

                    <div className='w-full h-px bg-[#E9EAEB]'></div>

                    {/* Mandiri */}
                    <div
                      className='flex items-center gap-3 cursor-pointer w-full h-10 p-2 rounded-lg hover:bg-gray-50 transition-colors'
                      onClick={() => setSelectedPayment('mandiri')}
                    >
                      <div className='w-10 h-10 border border-[#D5D7DA] rounded-lg flex items-center justify-center p-2 flex-shrink-0'>
                        <img
                          src={mandiriLogo}
                          alt='Mandiri'
                          className='w-full h-full object-contain'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                 <span class="text-xs font-bold text-blue-600">MDR</span>
                               `;
                            }
                          }}
                        />
                      </div>
                      <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1'>
                        Mandiri
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === 'mandiri'
                            ? 'bg-[#C12116]'
                            : 'border-2 border-[#A4A7AE]'
                        }`}
                      >
                        {selectedPayment === 'mandiri' && (
                          <div className='w-2 h-2 bg-white rounded-full'></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashed Line Separator */}
                <div className='w-full h-px border-t border-dashed border-[#D5D7DA]'></div>
                {/* Decorative Ellipses */}
                <div
                  className='absolute w-5 h-5 bg-gray-100 rounded-full -left-2.5'
                  style={{ top: '51%', zIndex: 3 }}
                ></div>
                <div
                  className='absolute w-5 h-5 bg-gray-100 rounded-full -right-2.5'
                  style={{ top: '51%', zIndex: 3 }}
                ></div>

                {/* Payment Summary Section */}
                <div className='flex flex-col items-start px-4 gap-3 w-full'>
                  <h3 className='font-nunito font-extrabold text-base leading-[30px] text-[#0A0D12] w-full'>
                    Payment Summary
                  </h3>

                  <div className='space-y-3 w-full'>
                    {/* Price */}
                    <div className='flex justify-between items-center w-full h-7'>
                      <span className='font-nunito font-medium text-sm leading-7 text-[#0A0D12]'>
                        Price ({cartItems.length} items)
                      </span>
                      <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12]'>
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    {/* Delivery Fee */}
                    <div className='flex justify-between items-center w-full h-7'>
                      <span className='font-nunito font-medium text-sm leading-7 text-[#0A0D12]'>
                        Delivery Fee
                      </span>
                      <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12]'>
                        {formatPrice(deliveryFee)}
                      </span>
                    </div>

                    {/* Service Fee */}
                    <div className='flex justify-between items-center w-full h-7'>
                      <span className='font-nunito font-medium text-sm leading-7 text-[#0A0D12]'>
                        Service Fee
                      </span>
                      <span className='font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12]'>
                        {formatPrice(serviceFee)}
                      </span>
                    </div>

                    {/* Total */}
                    <div className='flex justify-between items-center w-full h-8'>
                      <span className='font-nunito font-normal text-base leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                        Total
                      </span>
                      <span className='font-nunito font-extrabold text-base leading-[30px] text-[#0A0D12]'>
                        {formatPrice(total)}
                      </span>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={handleCheckout}
                      className='flex flex-row justify-center items-center px-2 py-2 gap-2 w-full h-11 bg-[#C12116] rounded-full hover:bg-[#B01E14] transition-colors'
                    >
                      <span className='font-nunito font-bold text-base leading-[30px] tracking-[-0.02em] text-[#FDFDFD]'>
                        Buy
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CheckoutPage;

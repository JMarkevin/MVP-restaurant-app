import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import redLogo from '/red-logo.png';
import type { CartItem } from '@/types';

interface OrderData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  paymentMethod: string;
  orderDate: string;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get order data from navigation state or localStorage
  useEffect(() => {
    // First try to get from navigation state
    if (location.state) {
      const navData = location.state as OrderData;
      setOrderData(navData);
      // Store in localStorage for persistence
      localStorage.setItem('lastOrderData', JSON.stringify(navData));
      setIsLoading(false);
    } else {
      // If no navigation state (page refresh), try to get from localStorage
      const storedData = localStorage.getItem('lastOrderData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData) as OrderData;
          setOrderData(parsedData);
        } catch (error) {
          console.error('Error parsing stored order data:', error);
        }
      }
      setIsLoading(false);
    }
  }, [location.state]);

  // Format currency
  const formatCurrency = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate item count
  const itemCount =
    orderData?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleSeeOrders = () => {
    // Clear stored order data when navigating away
    localStorage.removeItem('lastOrderData');

    // Invalidate orders cache to ensure fresh data is fetched
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    // Navigate to orders tab
    navigate('/profile?tab=orders');
  };

  // Cleanup function to clear stored data when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if navigating to a different page (not just refreshing)
      const currentPath = window.location.pathname;
      if (currentPath !== '/success') {
        localStorage.removeItem('lastOrderData');
      }
    };
  }, []);

  // Show loading state while retrieving order data
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 md:px-8'>
      {/* Header */}
      <div
        className='flex items-center gap-2 md:gap-4 mb-4 md:mb-7 cursor-pointer hover:opacity-80 transition-opacity'
        onClick={() => navigate('/')}
      >
        {/* Logo */}
        <img
          src={redLogo}
          alt='Foody Logo'
          className='w-8 h-8 md:w-10 md:h-10'
          onError={(e) => {
            // Fallback to colored div if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className='w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center hidden'>
          <div className='w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full'></div>
        </div>
        {/* Brand Name */}
        <h1 className='text-xl md:text-2xl font-extrabold text-gray-900'>
          Foody
        </h1>
      </div>

      {/* Main Content */}
      <div className='flex flex-col items-center'>
        {/* Success Card - Frame 58 */}
        <div
          className='bg-white rounded-2xl relative w-[320px] h-[400px] md:w-[428px] md:h-[546px] p-3 md:p-5 shadow-[0px_0px_20px_rgba(203,202,202,0.25)] flex flex-col items-center gap-2 md:gap-4'
          style={{
            isolation: 'isolate',
          }}
        >
          {/* Decorative Ellipses - Frame 67 & 68 */}
          <div className='absolute flex justify-between items-center w-[338px] md:w-[446px] h-4 md:h-5 -left-2 md:-left-[9px] top-[110px] md:top-[158px] z-10'>
            <div className='w-4 h-4 md:w-5 md:h-5 bg-[#F5F5F5] rounded-full'></div>
            <div className='w-4 h-4 md:w-5 md:h-5 bg-[#F5F5F5] rounded-full'></div>
          </div>

          <div className='absolute flex justify-between items-center w-[338px] md:w-[446px] h-4 md:h-5 -left-2 md:-left-[9px] top-[290px] md:top-[404px] z-10'>
            <div className='w-4 h-4 md:w-5 md:h-5 bg-[#F5F5F5] rounded-full'></div>
            <div className='w-4 h-4 md:w-5 md:h-5 bg-[#F5F5F5] rounded-full'></div>
          </div>

          {/* Success Icon and Message - Frame 66 */}
          <div className='flex flex-col justify-center items-center w-[290px] md:w-[388px] h-[90px] md:h-[132px] gap-0.5 md:gap-0.5 z-0'>
            {/* Checkmark Icon */}
            <div className='w-10 h-10 md:w-16 md:h-16 bg-[#44AB09] rounded-full flex items-center justify-center'>
              <Check
                className='w-5 h-5 md:w-8 md:h-8 text-white'
                style={{
                  strokeWidth: '3',
                }}
              />
            </div>

            {/* Payment Success Text */}
            <h2 className='w-[290px] md:w-[388px] h-[24px] md:h-[34px] font-nunito font-extrabold text-base md:text-xl leading-6 md:leading-[34px] text-[#0A0D12] text-center'>
              Payment Success
            </h2>

            {/* Success Message */}
            <p className='w-[290px] md:w-[388px] h-[20px] md:h-[30px] font-nunito font-normal text-xs md:text-base leading-5 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12] text-center'>
              Your payment has been successfully processed.
            </p>
          </div>

          {/* Dashed Line - Line 15 */}
          <div className='absolute w-[290px] md:w-[388px] h-px border-t border-dashed border-[#D5D7DA] z-10 left-4 md:left-5 top-[118px] md:top-[168px]'></div>

          {/* Payment Details */}
          <div className='absolute flex flex-col w-[290px] md:w-[388px] gap-2 md:gap-4 left-4 md:left-5 top-[207px] md:top-[288px] -translate-y-1/2 z-10'>
            {/* Date - Frame 57 */}
            <div className='flex justify-between items-center w-[290px] md:w-[388px] h-6 md:h-[30px] py-1 md:py-2 z-10'>
              <span className='font-nunito font-medium text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.03em] text-[#0A0D12]'>
                Date
              </span>
              <span className='font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                {orderData ? formatDate(orderData.orderDate) : 'N/A'}
              </span>
            </div>

            {/* Payment Method - Frame 58 */}
            <div className='flex justify-between items-center w-[290px] md:w-[388px] h-6 md:h-[30px] py-1 md:py-2 z-10'>
              <span className='font-nunito font-medium text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.03em] text-[#0A0D12]'>
                Payment Method
              </span>
              <span className='font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                {orderData?.paymentMethod || 'Bank Nasional Indonesia'}
              </span>
            </div>

            {/* Price - Frame 53 */}
            <div className='flex justify-between items-center w-[290px] md:w-[388px] h-6 md:h-[30px] py-1 md:py-2 z-10'>
              <span className='font-nunito font-medium text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.03em] text-[#0A0D12]'>
                Price ({itemCount} items)
              </span>
              <span className='font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                {orderData ? formatCurrency(orderData.subtotal) : 'Rp0'}
              </span>
            </div>

            {/* Delivery Fee - Frame 54 */}
            <div className='flex justify-between items-center w-[290px] md:w-[388px] h-6 md:h-[30px] py-1 md:py-2 z-10'>
              <span className='font-nunito font-medium text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.03em] text-[#0A0D12]'>
                Delivery Fee
              </span>
              <span className='font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                {orderData ? formatCurrency(orderData.deliveryFee) : 'Rp10.000'}
              </span>
            </div>

            {/* Service Fee - Frame 55 */}
            <div className='flex justify-between items-center w-[290px] md:w-[388px] h-6 md:h-[30px] py-1 md:py-2 z-10'>
              <span className='font-nunito font-medium text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.03em] text-[#0A0D12]'>
                Service Fee
              </span>
              <span className='font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12]'>
                {orderData ? formatCurrency(orderData.serviceFee) : 'Rp1.000'}
              </span>
            </div>
          </div>

          {/* Dashed Line - Line 14 */}
          <div className='absolute w-[290px] md:w-[388px] h-px border-t border-dashed border-[#D5D7DA] z-10 left-4 md:left-5 top-[296px] md:top-[412px]'></div>

          {/* Total - Frame 56 */}
          <div className='absolute flex justify-between items-center w-[290px] md:w-[388px] h-7 md:h-8 gap-[100px] md:gap-[135px] z-10 left-3 md:left-5 top-[315px] md:top-[430px]'>
            <span className='w-[28px] md:w-[41px] h-7 md:h-8 font-nunito font-normal text-sm md:text-lg leading-7 md:leading-8 text-[#0A0D12] text-left'>
              Total
            </span>
            <span className='h-7 md:h-8 font-nunito font-extrabold text-sm md:text-lg leading-7 md:leading-8 tracking-[-0.02em] text-[#0A0D12] text-right'>
              {orderData ? formatCurrency(orderData.total) : 'Rp0'}
            </span>
          </div>

          {/* See My Orders Button */}
          <button
            onClick={handleSeeOrders}
            className='absolute flex justify-center items-center w-[290px] md:w-[388px] h-10 md:h-12 px-2 py-2 gap-2 bg-[#C12116] rounded-full hover:opacity-90 transition-opacity z-10 left-3 md:left-5 top-[345px] md:top-[470px]'
          >
            <span className='w-[80px] md:w-[106px] h-6 md:h-[30px] font-nunito font-bold text-xs md:text-base leading-6 md:leading-[30px] tracking-[-0.02em] text-[#FDFDFD]'>
              See My Orders
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

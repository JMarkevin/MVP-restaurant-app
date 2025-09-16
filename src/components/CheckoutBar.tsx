import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/app/store';
import ShoppingBagIcon from '/shoppingbag-icon.svg';

interface CheckoutBarProps {
  onCheckout?: () => void;
}

const CheckoutBar: React.FC<CheckoutBarProps> = ({ onCheckout }) => {
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  // Calculate total items and total price
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Don't show the bar if cart is empty
  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className='flex flex-row items-center justify-between px-4 md:px-30 mt-6 md:mt-6 fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto w-screen md:w-full max-w-[393px] md:max-w-[1440px] h-16 md:h-20 bg-white md:bg-white rounded-none md:rounded-2xl z-50'
      style={{
        boxShadow: '0px 0px 20px rgba(203, 202, 202, 0.25)',
      }}
    >
      {/* Frame 90 - Cart Summary */}
      <div
        className='flex flex-col items-start px-0 gap-0.5 flex-none order-0 flex-grow-0'
        style={{
          width: '107px',
          height: '60px',
        }}
      >
        {/* Frame 89 - Item Count Row */}
        <div
          className='flex flex-row items-center px-0 gap-1 flex-none order-0 flex-grow-0'
          style={{
            width: '69px',
            height: '28px',
          }}
        >
          {/* Shopping Bag Icon */}
          <div
            className='flex-none order-0 flex-grow-0'
            style={{
              width: '20px',
              height: '20px',
              position: 'relative',
            }}
          >
            <img
              src={ShoppingBagIcon}
              alt='Shopping Bag'
              style={{
                width: '20px',
                height: '20px',
                filter:
                  'brightness(0) saturate(100%) invert(8%) sepia(5%) saturate(2000%) hue-rotate(200deg) brightness(95%) contrast(95%)',
              }}
            />
          </div>

          {/* Item Count Text */}
          <div
            className='font-nunito font-normal text-[#0A0D12] flex-none order-1 flex-grow-0'
            style={{
              width: '45px',
              height: '28px',
              fontSize: '14px',
              lineHeight: '28px',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {totalItems} Items
          </div>
        </div>

        {/* Total Price */}
        <div
          className='font-nunito font-extrabold text-[#0A0D12] flex-none order-1 self-stretch flex-grow-0'
          style={{
            width: '107px',
            height: '30px',
            fontSize: '16px',
            lineHeight: '30px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Rp{totalPrice.toLocaleString()}
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        className='flex flex-row justify-center items-center px-2 gap-2 bg-[#C12116] rounded-full flex-none order-1 flex-grow-0'
        style={{
          width: '160px',
          height: '40px',
        }}
      >
        <span
          className='font-nunito font-bold text-[#FDFDFD] flex-none order-0 flex-grow-0'
          style={{
            width: '59px',
            height: '28px',
            fontSize: '14px',
            lineHeight: '28px',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Checkout
        </span>
      </button>
    </div>
  );
};

export default CheckoutBar;

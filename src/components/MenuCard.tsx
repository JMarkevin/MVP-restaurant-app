import React from 'react';
import { Button } from '@/ui/button';
import type { MenuItem } from '@/types';

interface MenuCardProps {
  menu: MenuItem;
  quantity: number;
  onAddToCart: (menu: MenuItem) => void;
  onQuantityChange: (menuId: string, change: number) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  quantity,
  onAddToCart,
  onQuantityChange,
}) => {
  return (
    <div
      className='flex flex-col items-start p-0 bg-white rounded-2xl overflow-hidden w-[172px] md:w-[285px] min-h-[306px] md:min-h-[379px]'
      style={{
        boxShadow: '0px 0px 20px rgba(203, 202, 202, 0.25)',
        borderRadius: '16px',
      }}
    >
      {/* Menu Image - Rectangle 4 */}
      <div
        className='bg-gray-100 flex items-center justify-center w-[172px] h-[172px] md:w-[285px] md:h-[285px]'
        style={{
          borderRadius: '16px 16px 0px 0px',
        }}
      >
        {menu.image ? (
          <img
            src={menu.image}
            alt={menu.name}
            className='w-full h-full object-cover rounded-t-2xl'
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="flex flex-col items-center justify-center text-gray-400">
                    <svg class="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">No Image</span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className='flex flex-col items-center justify-center text-gray-400'>
            <svg
              className='w-16 h-16 mb-2'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-sm font-medium'>No Image</span>
          </div>
        )}
      </div>

      {/* Frame 14 - Menu Info Container */}
      <div className='flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between w-[172px] md:w-[285px] min-h-[134px] md:min-h-[94px] p-3 md:p-4 gap-4 md:gap-[70px]'>
        {/* Frame 12 - Food Name and Price */}
        <div className='flex flex-col items-start w-[91px] md:w-[91px] min-h-[86px] md:min-h-[92px]'>
          {/* Food Name */}
          <div
            className='text-gray-900 w-[100px] min-h-[56px] md:min-h-[60px] font-nunito font-medium text-sm md:text-base leading-7 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12]'
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
            }}
            title={menu.name}
          >
            {menu.name}
          </div>

          {/* Price */}
          <div className='text-gray-900 w-[91px] h-[30px] md:h-[32px] font-nunito font-extrabold text-base md:text-lg leading-[30px] md:leading-[32px] tracking-[-0.02em] text-[#0A0D12]'>
            Rp{menu.price.toLocaleString()}
          </div>
        </div>

        {/* Frame 13/20 - Add Button or Quantity Controls */}
        {quantity === 0 ? (
          <Button
            onClick={() => onAddToCart(menu)}
            className='flex flex-row justify-center items-center w-[148px] md:w-[79px] h-9 md:h-10 px-2 md:px-2 gap-2 md:gap-2 bg-[#C12116] rounded-full'
          >
            <span className='font-nunito font-bold text-sm md:text-base leading-7 md:leading-[30px] tracking-[-0.02em] text-white'>
              Add
            </span>
          </Button>
        ) : (
          <div className='flex flex-row items-center justify-center w-[114px] md:w-[100px] h-9 md:h-10 p-0 gap-2 md:gap-2 mx-auto md:mx-0'>
            {/* Frame 19 - Minus Button */}
            <button
              onClick={() => onQuantityChange(menu.id, -1)}
              className='flex flex-row justify-center items-center w-9 h-9 md:w-8 md:h-8 p-1 md:p-1 border border-[#D5D7DA] rounded-full bg-transparent cursor-pointer flex-shrink-0'
              aria-label='Decrease quantity'
            >
              <div className='w-4 h-4 md:w-4 md:h-4 relative flex items-center justify-center'>
                {/* Minus line */}
                <div className='w-2 h-0.5 md:w-2 md:h-0.5 bg-[#0A0D12]' />
              </div>
            </button>

            {/* Quantity Display */}
            <div className='min-w-4 h-7 md:h-8 font-nunito font-semibold text-base md:text-base leading-7 md:leading-8 tracking-[-0.02em] text-[#0A0D12] flex items-center justify-center flex-shrink-0'>
              {quantity}
            </div>

            {/* Frame 18 - Plus Button */}
            <button
              onClick={() => onQuantityChange(menu.id, 1)}
              className='flex flex-row items-center justify-center w-9 h-9 md:w-8 md:h-8 p-1 md:p-1 bg-[#C12116] rounded-full border-none cursor-pointer flex-shrink-0'
              aria-label='Increase quantity'
            >
              {/* Plus Icon - Single div with CSS borders */}
              <div className='w-4 h-4 md:w-4 md:h-4 relative flex items-center justify-center'>
                {/* Horizontal line */}
                <div className='absolute w-2 h-0.5 md:w-2 md:h-0.5 bg-white' />
                {/* Vertical line */}
                <div className='absolute w-0.5 h-2 md:w-0.5 md:h-2 bg-white' />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;

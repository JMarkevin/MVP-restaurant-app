import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card } from '@/ui/card';
import type { Restaurant } from '@/types';
import { getRestaurantDistance, formatDistance } from '@/utils/distance';
import { useGeolocation } from '@/hooks/useGeolocation';
import restaurantPlaceholder from '/restaurant-placeholder.jpg';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onClick,
  userLocation: propUserLocation,
}) => {
  const navigate = useNavigate();

  // Use geolocation hook to get user's current location
  const { latitude, longitude } = useGeolocation();

  // Use prop location if provided, otherwise use geolocation hook
  const userLocation =
    propUserLocation ||
    (latitude && longitude ? { latitude, longitude } : null);

  const distance = getRestaurantDistance(restaurant, userLocation);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/restaurants/${restaurant.id}`);
    }
  };
  return (
    <Card
      className='flex flex-row items-center p-3 md:p-4 gap-2 md:gap-3 w-full md:w-[370px] h-[114px] md:h-[152px] bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] rounded-2xl flex-none order-0 flex-grow-0 cursor-pointer transition-all duration-200 border-none hover:shadow-[0px_0px_25px_rgba(203,202,202,0.35)]'
      onClick={handleClick}
    >
      {/* Restaurant Image - Rectangle 3 */}
      <div className='w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-xl flex-none order-0 flex-grow-0 overflow-hidden bg-gray-100'>
        <img
          src={
            restaurant.images?.[0] ||
            restaurant.logo ||
            '/src/assets/images/restaurant-placeholder.jpg'
          }
          alt={restaurant.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const currentSrc = target.src;

            // Try fallback chain: images[0] -> logo -> placeholder
            if (currentSrc === restaurant.images?.[0]) {
              // Try logo if first image fails
              target.src =
                restaurant.logo ||
                '/src/assets/images/restaurant-placeholder.jpg';
            } else if (currentSrc === restaurant.logo) {
              // Try placeholder if logo fails
              target.src = restaurantPlaceholder;
            } else {
              // Final fallback to placeholder
              target.src = restaurantPlaceholder;
            }
          }}
        />
      </div>

      {/* Restaurant Info - Frame 2 */}
      <div className='flex flex-col items-start p-0 gap-0.5 w-[239px] md:w-[206px] h-[90px] md:h-[96px] flex-none order-1 flex-grow'>
        {/* Restaurant Name - Burger King */}
        <div className='w-[239px] md:w-[206px] h-[30px] md:h-[32px] font-nunito font-extrabold text-base md:text-lg leading-[30px] md:leading-8 tracking-[-0.02em] text-[#0A0D12] flex-none order-0 self-stretch flex-grow-0'>
          {restaurant.name}
        </div>

        {/* Rating - Frame 1 */}
        <div className='flex flex-row items-center p-0 gap-1 w-[239px] md:w-[206px] h-[28px] md:h-[30px] flex-none order-1 self-stretch flex-grow-0'>
          {/* Star */}
          <div className='w-6 h-6 flex-none order-0 flex-grow-0 flex items-center justify-center'>
            <Star className='w-6 h-6 text-[#FFAB0D] fill-[#FFAB0D]' />
          </div>
          {/* Rating Number - 4.9 */}
          <div className='w-[21px] h-[28px] md:h-[30px] font-nunito font-medium text-sm md:text-base leading-7 md:leading-[30px] text-center tracking-[-0.03em] text-[#0A0D12] flex-none order-1 flex-grow-0'>
            {restaurant.star?.toFixed(1) || 'N/A'}
          </div>
        </div>

        {/* Location and Distance - Frame 7 */}
        <div className='flex flex-row items-center p-0 gap-1.5 min-w-[239px] md:min-w-[206px] h-[28px] md:h-[30px] flex-none order-2 self-stretch flex-grow-0'>
          {/* Location - Jakarta Selatan */}
          <div className='w-[92px] md:w-[105px] h-[28px] md:h-[30px] font-nunito font-normal text-sm md:text-base leading-7 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12] flex-none order-0 flex-grow-0'>
            {restaurant.place}
          </div>
          {/* Separator - Ellipse 1 */}
          <div className='w-0.5 h-0.5 bg-[#0A0D12] rounded-full flex-none order-1 flex-grow-0' />
          {/* Distance - 2.4 km */}
          <div className='min-w-[42px] md:min-w-[48px] h-[28px] md:h-[30px] font-nunito font-normal text-sm md:text-base leading-7 md:leading-[30px] tracking-[-0.02em] text-[#0A0D12] flex-none order-2 flex-grow-0 whitespace-nowrap'>
            {formatDistance(distance)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;

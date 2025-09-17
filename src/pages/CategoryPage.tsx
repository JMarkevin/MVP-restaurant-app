import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, ListFilter } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getRestaurantDistance, formatDistance } from '@/utils/distance';
import { restaurantsApi } from '@/services/api/restaurants';
import RestaurantCard from '@/components/RestaurantCard';
import ImageWithFallback from '@/components/ImageWithFallback';
import Footer from '@/components/Footer';
import {
  toggleDistance,
  setPriceMin,
  setPriceMax,
  toggleRating,
  clearFilters,
} from '@/features/filters/filtersSlice';
import type { RootState } from '@/app/store';
import type { Restaurant } from '@/types';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { latitude, longitude } = useGeolocation();

  // Get filters from Redux store
  const filters = useSelector((state: RootState) => state.filters);

  // Get filter parameter from URL
  const urlFilter = searchParams.get('filter');

  // Pagination state
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset pagination when category changes
    setAllRestaurants([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsInitialLoading(true);
  }, [category]);

  // Auto-apply filters based on URL parameter
  useEffect(() => {
    if (urlFilter && category === 'all') {
      // Clear existing filters first
      dispatch(clearFilters());

      // Apply specific filter based on URL parameter
      switch (urlFilter) {
        case 'nearby':
          // Apply nearby filter (within 1km)
          dispatch(toggleDistance('1km'));
          break;
        case 'discount':
          // Set price range for discount (under 50k IDR)
          dispatch(setPriceMax('50000'));
          break;
        case 'bestseller':
          // Set rating filter for best sellers (4+ stars)
          dispatch(toggleRating('4'));
          break;
        case 'delivery':
          // No specific filter needed for delivery - show all
          break;
        case 'lunch':
          // No specific filter needed for lunch - show all
          break;
        default:
          break;
      }
    }
  }, [urlFilter, category, dispatch]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.distance.length > 0 ||
    !!filters.priceMin ||
    !!filters.priceMax ||
    filters.rating.length > 0;

  // Fetch restaurants with pagination (normal browsing)
  const {
    data: restaurantsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['restaurants', category, currentPage, latitude, longitude],
    queryFn: async () => {
      // Use getRestaurants with pagination parameters and location
      const result = await restaurantsApi.getRestaurants({
        page: currentPage,
        limit: 10,
        location:
          latitude && longitude ? `${latitude},${longitude}` : undefined,
      });
      return {
        restaurants: result,
        hasMore: result.length === 10, // Assume more if we got exactly 10
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    enabled: hasMore && !hasActiveFilters, // Disable when filters are active
  });

  // Fetch comprehensive data when filters are applied
  const { data: filterResults, isLoading: isFilterLoading } = useQuery({
    queryKey: ['restaurants-filter', category, filters, latitude, longitude],
    queryFn: async () => {
      const allFilterResults: Restaurant[] = [];

      // Load multiple pages to get more restaurants for filtering
      for (let page = 1; page <= 5; page++) {
        try {
          const result = await restaurantsApi.getRestaurants({
            page: page,
            limit: 12, // Use same limit as normal pagination
            location:
              latitude && longitude ? `${latitude},${longitude}` : undefined,
          });

          if (result.length === 0) break; // No more results

          allFilterResults.push(...result);

          // If we got less than 12, we've reached the end
          if (result.length < 12) break;
        } catch {
          break; // Stop on error
        }
      }

      return allFilterResults;
    },
    enabled: hasActiveFilters && !!category,
    staleTime: 10 * 60 * 1000, // 10 minutes cache for filter results
  });

  // Update restaurants when new data arrives
  useEffect(() => {
    if (hasActiveFilters && filterResults && Array.isArray(filterResults)) {
      // When filters are active, use filter results
      setAllRestaurants(filterResults);
      setHasMore(false); // No pagination when filtering
      setIsLoadingMore(false);
      setIsInitialLoading(false);
    } else if (restaurantsData && !hasActiveFilters) {
      // Normal pagination when no filters
      if (currentPage === 1) {
        // First page - replace all restaurants
        setAllRestaurants(restaurantsData.restaurants);
      } else {
        // Subsequent pages - append to existing restaurants, avoiding duplicates
        setAllRestaurants((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newRestaurants = restaurantsData.restaurants.filter(
            (r) => !existingIds.has(r.id)
          );
          return [...prev, ...newRestaurants];
        });
      }
      setHasMore(restaurantsData.hasMore);
      setIsLoadingMore(false);
      setIsInitialLoading(false);
    }
  }, [restaurantsData, filterResults, currentPage, hasActiveFilters]);

  // Load more restaurants
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading]);

  // Scroll detection for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Filter restaurants based on Redux filters only
  const filteredRestaurants = useMemo(() => {
    let filtered = allRestaurants;

    // Apply distance filters
    if (filters.distance.length > 0 && latitude && longitude) {
      filtered = filtered.filter((restaurant) => {
        if (!restaurant.coordinates?.lat || !restaurant.coordinates?.long) {
          return false;
        }

        const distance = getRestaurantDistance(restaurant, {
          latitude,
          longitude,
        });

        if (distance === null) {
          return false;
        }

        return filters.distance.some((d) => {
          switch (d) {
            case 'nearby':
              return distance <= 1;
            case '1km':
              return distance <= 1;
            case '3km':
              return distance <= 3;
            case '5km':
              return distance <= 5;
            default:
              return true;
          }
        });
      });
    }

    // Apply price filters
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin);
      filtered = filtered.filter((restaurant) => {
        const restaurantMinPrice = restaurant.priceRange?.min;
        return restaurantMinPrice && restaurantMinPrice >= minPrice;
      });
    }
    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax);
      filtered = filtered.filter((restaurant) => {
        const restaurantMaxPrice = restaurant.priceRange?.max;
        return restaurantMaxPrice && restaurantMaxPrice <= maxPrice;
      });
    }

    // Apply rating filters
    if (filters.rating.length > 0) {
      filtered = filtered.filter((restaurant) =>
        filters.rating.some((r) => {
          const rating = parseFloat(r);
          const restaurantRating = restaurant.star;

          if (!restaurantRating) return false;

          // Specific star range logic:
          // 5 stars: exactly 5.0
          // 4 stars: 4.0-4.9
          // 3 stars: 3.0-3.9
          // 2 stars: 2.0-2.9
          // 1 star: 1.0-1.9
          if (rating === 5) {
            return restaurantRating >= 5.0;
          } else if (rating === 4) {
            return restaurantRating >= 4.0 && restaurantRating < 5.0;
          } else if (rating === 3) {
            return restaurantRating >= 3.0 && restaurantRating < 4.0;
          } else if (rating === 2) {
            return restaurantRating >= 2.0 && restaurantRating < 3.0;
          } else if (rating === 1) {
            return restaurantRating >= 1.0 && restaurantRating < 2.0;
          }

          return false;
        })
      );
    }

    return filtered;
  }, [allRestaurants, filters, latitude, longitude]);

  const handleDistanceToggle = (distance: string) => {
    dispatch(toggleDistance(distance));
  };

  const handlePriceMinChange = (value: string) => {
    dispatch(setPriceMin(value));
  };

  const handlePriceMaxChange = (value: string) => {
    dispatch(setPriceMax(value));
  };

  const handleRatingToggle = (rating: string) => {
    dispatch(toggleRating(rating));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'all':
        return 'All Restaurants';
      case 'nearby':
        return 'Nearby Restaurants';
      case 'discount':
        return 'Restaurants with Discounts';
      case 'bestseller':
        return 'Best Seller Restaurants';
      case 'delivery':
        return 'Delivery Restaurants';
      case 'lunch':
        return 'Lunch Restaurants';
      default:
        return 'All Restaurants';
    }
  };

  return (
    <div className='min-h-screen bg-white pt-20'>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 md:px-30 py-4 md:py-8'>
        {/* Mobile: Frame 117 Layout */}
        <div className='md:hidden flex flex-col items-start px-0 gap-4 w-full max-w-[361px] mx-auto'>
          {/* All Restaurant Title */}
          <h1 className='font-nunito font-extrabold text-2xl leading-9 text-[#0A0D12] w-full'>
            {getCategoryTitle()}
          </h1>

          {/* Mobile Filter Bar - Frame 116 */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className='flex flex-row justify-between items-center bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] cursor-pointer hover:bg-gray-50 transition-colors'
            style={{
              padding: '12px',
              width: '361px',
              height: '52px',
            }}
          >
            {/* Filter Title */}
            <div className='font-nunito font-extrabold text-sm leading-7 text-[#0A0D12]'>
              Filter
            </div>

            {/* Filter Icon */}
            <div className='w-5 h-5 flex items-center justify-center'>
              <ListFilter className='w-5 h-5 text-[#0A0D12]' />
            </div>
          </button>

          {/* Mobile Restaurant Cards - Frame 115 */}
          <div className='flex flex-col items-start px-0 gap-4 w-full'>
            {isInitialLoading || (hasActiveFilters && isFilterLoading) ? (
              <div className='flex justify-center items-center py-16 w-full'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
                {hasActiveFilters && isFilterLoading && (
                  <p className='ml-4 text-gray-600'>Applying filters...</p>
                )}
              </div>
            ) : error ? (
              <div className='text-center py-16 w-full'>
                <p className='text-red-600 text-lg'>
                  Failed to load restaurants
                </p>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className='text-center py-16 w-full'>
                <p className='text-gray-600 text-lg'>No restaurants found</p>
              </div>
            ) : (
              <>
                {filteredRestaurants.map((restaurant, index) => {
                  const userLocation =
                    latitude && longitude ? { latitude, longitude } : null;
                  const distance = userLocation
                    ? getRestaurantDistance(restaurant, userLocation)
                    : null;

                  return (
                    <div
                      key={`${restaurant.id}-${index}`}
                      className='flex flex-row items-center p-3 gap-2 w-full h-[114px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] cursor-pointer hover:shadow-[0px_0px_25px_rgba(203,202,202,0.35)] transition-shadow'
                      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    >
                      {/* Restaurant Logo - Rectangle 3 */}
                      <div className='w-[90px] h-[90px] rounded-xl flex-shrink-0'>
                        <ImageWithFallback
                          src={
                            restaurant.logo ||
                            '/src/assets/images/restaurant-placeholder.jpg'
                          }
                          alt={restaurant.name}
                          className='w-full h-full object-cover rounded-xl'
                          fallbackText='No Logo'
                        />
                      </div>

                      {/* Restaurant Details - Frame 2 */}
                      <div className='flex flex-col items-start px-0 gap-0.5 flex-1 h-[90px]'>
                        {/* Restaurant Name */}
                        <h3 className='font-nunito font-extrabold text-base leading-[30px] text-[#0A0D12] w-full h-[30px]'>
                          {restaurant.name}
                        </h3>

                        {/* Rating Row - Frame 1 */}
                        <div className='flex flex-row items-center px-0 gap-1 w-full h-7'>
                          {/* Star Icon */}
                          <div className='w-6 h-6 flex-shrink-0'>
                            <Star className='w-6 h-6 text-[#FFAB0D] fill-current' />
                          </div>

                          {/* Rating Text */}
                          <span className='font-nunito font-medium text-sm leading-7 text-center text-[#0A0D12] w-[21px] h-7'>
                            {restaurant.star?.toFixed(1) || 'N/A'}
                          </span>
                        </div>

                        {/* Location and Distance Row - Frame 7 */}
                        <div className='flex flex-row items-center px-0 gap-1.5 w-full h-7'>
                          {/* Location */}
                          <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-shrink-0'>
                            {restaurant.place}
                          </span>

                          {/* Dot Separator */}
                          <div className='w-0.5 h-0.5 bg-[#0A0D12] rounded-full flex-shrink-0'></div>

                          {/* Distance */}
                          <span className='font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-shrink-0 whitespace-nowrap'>
                            {distance ? formatDistance(distance) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className='flex justify-center items-center py-8 w-full'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
                    <span className='ml-3 text-gray-600'>
                      Loading more restaurants...
                    </span>
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && allRestaurants.length > 0 && (
                  <div className='text-center py-8 w-full'>
                    <p className='text-gray-500 text-sm'>
                      You've reached the end of the list
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden md:block'>
          {/* Page Title */}
          <h1 className='text-3xl font-extrabold text-gray-900 mb-8'>
            {getCategoryTitle()}
          </h1>

          <div className='flex gap-10'>
            {/* Left Sidebar - Filters */}
            <div className='w-64 bg-white rounded-xl shadow-lg p-4'>
              {/* Filter Title */}
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-extrabold text-gray-900'>FILTER</h2>
                <button
                  onClick={handleClearFilters}
                  className='text-sm text-red-600 hover:text-red-700 font-medium'
                >
                  Clear All
                </button>
              </div>

              {/* Distance Filter */}
              <div className='mb-6'>
                <h3 className='text-lg font-extrabold text-gray-900 mb-4'>
                  Distance
                </h3>
                <div className='space-y-3'>
                  {[
                    { key: 'nearby', label: 'Nearby' },
                    { key: '1km', label: 'Within 1 km' },
                    { key: '3km', label: 'Within 3 km' },
                    { key: '5km', label: 'Within 5 km' },
                  ].map(({ key, label }) => (
                    <div key={key} className='flex items-center gap-2'>
                      <div
                        className={`w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center ${
                          filters.distance.includes(key)
                            ? 'bg-red-600 border-red-600'
                            : 'border-gray-400'
                        }`}
                        onClick={() => handleDistanceToggle(key)}
                      >
                        {filters.distance.includes(key) && (
                          <div className='w-2 h-2 bg-white rounded-sm'></div>
                        )}
                      </div>
                      <span className='text-base text-gray-900'>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className='border-t border-gray-300 my-6'></div>

              {/* Price Filter */}
              <div className='mb-6'>
                <h3 className='text-lg font-extrabold text-gray-900 mb-4'>
                  Price
                </h3>
                <div className='space-y-3'>
                  {/* Minimum Price */}
                  <div className='border border-gray-300 rounded-lg p-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-10 h-10 bg-gray-100 rounded flex items-center justify-center'>
                        <span className='text-base font-bold text-gray-900'>
                          Rp
                        </span>
                      </div>
                      <input
                        type='number'
                        placeholder='Minimum Price'
                        value={filters.priceMin}
                        onChange={(e) => handlePriceMinChange(e.target.value)}
                        className='flex-1 text-base text-gray-500 outline-none'
                      />
                    </div>
                  </div>

                  {/* Maximum Price */}
                  <div className='border border-gray-300 rounded-lg p-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-10 h-10 bg-gray-100 rounded flex items-center justify-center'>
                        <span className='text-base font-bold text-gray-900'>
                          Rp
                        </span>
                      </div>
                      <input
                        type='number'
                        placeholder='Maximum Price'
                        value={filters.priceMax}
                        onChange={(e) => handlePriceMaxChange(e.target.value)}
                        className='flex-1 text-base text-gray-500 outline-none'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className='border-t border-gray-300 my-6'></div>

              {/* Rating Filter */}
              <div>
                <h3 className='text-lg font-extrabold text-gray-900 mb-4'>
                  Rating
                </h3>
                <div className='space-y-3'>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className='flex items-center gap-2 p-2'>
                      <div
                        className={`w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center ${
                          filters.rating.includes(rating.toString())
                            ? 'bg-red-600 border-red-600'
                            : 'border-gray-400'
                        }`}
                        onClick={() => handleRatingToggle(rating.toString())}
                      >
                        {filters.rating.includes(rating.toString()) && (
                          <div className='w-2 h-2 bg-white rounded-sm'></div>
                        )}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Star className='w-6 h-6 text-yellow-400 fill-current' />
                        <span className='text-base text-gray-900'>
                          {rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Restaurant Grid */}
            <div className='flex-1'>
              {isInitialLoading || (hasActiveFilters && isFilterLoading) ? (
                <div className='flex justify-center items-center py-16'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
                  {hasActiveFilters && isFilterLoading && (
                    <p className='ml-4 text-gray-600'>Applying filters...</p>
                  )}
                </div>
              ) : error ? (
                <div className='text-center py-16'>
                  <p className='text-red-600 text-lg'>
                    Failed to load restaurants
                  </p>
                </div>
              ) : filteredRestaurants.length === 0 ? (
                <div className='text-center py-16'>
                  <p className='text-gray-600 text-lg'>No restaurants found</p>
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-2 gap-5'>
                    {filteredRestaurants.map((restaurant, index) => {
                      const userLocation =
                        latitude && longitude ? { latitude, longitude } : null;
                      return (
                        <RestaurantCard
                          key={`${restaurant.id}-${index}`}
                          restaurant={restaurant}
                          userLocation={userLocation}
                        />
                      );
                    })}
                  </div>

                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div className='flex justify-center items-center py-8'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
                      <span className='ml-3 text-gray-600'>
                        Loading more restaurants...
                      </span>
                    </div>
                  )}

                  {/* End of results indicator */}
                  {!hasMore && allRestaurants.length > 0 && (
                    <div className='text-center py-8'>
                      <p className='text-gray-500 text-sm'>
                        You've reached the end of the list
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-[999999] md:hidden'
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          {/* Mobile Sidebar */}
          <div
            className='fixed left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[999999]'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className='flex items-center p-4 border-b border-gray-200'>
              <h2 className='text-lg font-extrabold text-gray-900'>FILTER</h2>
            </div>

            {/* Close Button - Outside Sidebar */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className='absolute flex flex-row justify-center items-center bg-white rounded-full shadow-lg z-[999999]'
              style={{
                padding: '5.33px',
                gap: '10.67px',
                width: '32px',
                height: '32px',
                left: '306px',
                top: '16px',
              }}
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            {/* Sidebar Content */}
            <div className='p-4 space-y-4 overflow-y-auto h-full'>
              {/* Clear All Button */}
              <div className='flex justify-end mb-3'>
                <button
                  onClick={handleClearFilters}
                  className='text-sm text-red-600 hover:text-red-700 font-medium'
                >
                  Clear All
                </button>
              </div>

              {/* Distance Filter */}
              <div>
                <h3 className='text-base font-extrabold text-gray-900 mb-3'>
                  Distance
                </h3>
                <div className='space-y-2'>
                  {[
                    { key: 'nearby', label: 'Nearby' },
                    { key: '1km', label: 'Within 1 km' },
                    { key: '3km', label: 'Within 3 km' },
                    { key: '5km', label: 'Within 5 km' },
                  ].map(({ key, label }) => (
                    <div key={key} className='flex items-center gap-2 py-1'>
                      <div
                        className={`w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center ${
                          filters.distance.includes(key)
                            ? 'bg-red-600 border-red-600'
                            : 'border-gray-400'
                        }`}
                        onClick={() => handleDistanceToggle(key)}
                      >
                        {filters.distance.includes(key) && (
                          <div className='w-2 h-2 bg-white rounded-sm'></div>
                        )}
                      </div>
                      <span className='text-sm text-gray-900'>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className='border-t border-gray-300 my-3'></div>

              {/* Price Filter */}
              <div>
                <h3 className='text-base font-extrabold text-gray-900 mb-3'>
                  Price
                </h3>
                <div className='space-y-3'>
                  {/* Minimum Price */}
                  <div className='border border-gray-300 rounded-lg p-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-9 h-9 bg-gray-100 rounded flex items-center justify-center'>
                        <span className='text-sm font-bold text-gray-900'>
                          Rp
                        </span>
                      </div>
                      <input
                        type='number'
                        placeholder='Minimum Price'
                        value={filters.priceMin}
                        onChange={(e) => handlePriceMinChange(e.target.value)}
                        className='flex-1 text-sm text-gray-500 outline-none'
                      />
                    </div>
                  </div>

                  {/* Maximum Price */}
                  <div className='border border-gray-300 rounded-lg p-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-9 h-9 bg-gray-100 rounded flex items-center justify-center'>
                        <span className='text-sm font-bold text-gray-900'>
                          Rp
                        </span>
                      </div>
                      <input
                        type='number'
                        placeholder='Maximum Price'
                        value={filters.priceMax}
                        onChange={(e) => handlePriceMaxChange(e.target.value)}
                        className='flex-1 text-sm text-gray-500 outline-none'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className='border-t border-gray-300 my-3'></div>

              {/* Rating Filter */}
              <div>
                <h3 className='text-base font-extrabold text-gray-900 mb-3'>
                  Rating
                </h3>
                <div className='space-y-2'>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className='flex items-center gap-2 py-1'>
                      <div
                        className={`w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center ${
                          filters.rating.includes(rating.toString())
                            ? 'bg-red-600 border-red-600'
                            : 'border-gray-400'
                        }`}
                        onClick={() => handleRatingToggle(rating.toString())}
                      >
                        {filters.rating.includes(rating.toString()) && (
                          <div className='w-2 h-2 bg-white rounded-sm'></div>
                        )}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Star className='w-5 h-5 text-yellow-400 fill-current' />
                        <span className='text-sm text-gray-900'>{rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;

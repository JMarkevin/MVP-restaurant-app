import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import RestaurantCard from '@/components/RestaurantCard';
import ShowMoreButton from '@/components/ShowMoreButton';
import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '@/services/api/restaurants';
import { useCategoriesQuery } from '@/services/queries/categories';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getRestaurantDistance } from '@/utils/distance';
import type { Restaurant } from '@/types';
import bgMainpage from '/bg-mainpage.png';

const HomePage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [originalMode] = useState<'login' | 'register'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // Pagination state
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(5);

  // Get user's location for distance calculation
  const { latitude, longitude, error: locationError } = useGeolocation();

  // Only fetch restaurants when we have location or after a timeout
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    // Start fetching after 100ms regardless of location status
    const timer = setTimeout(() => {
      setShouldFetch(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Search restaurants - load multiple pages for comprehensive search
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['restaurants-search', searchQuery, latitude, longitude],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const allSearchResults: Restaurant[] = [];

      // Load multiple pages to get more restaurants for search
      for (let page = 1; page <= 5; page++) {
        try {
          const result = await restaurantsApi.getRestaurants({
            page: page,
            limit: 12, // Use same limit as normal pagination
            location:
              latitude && longitude ? `${latitude},${longitude}` : undefined,
          });

          if (result.length === 0) break; // No more results

          allSearchResults.push(...result);

          // If we got less than 12, we've reached the end
          if (result.length < 12) break;
        } catch {
          break; // Stop on error
        }
      }

      return allSearchResults;
    },
    enabled: !!searchQuery.trim() && shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for search results
  });

  // Fetch restaurants with pagination
  const {
    data: restaurantsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['restaurants', currentPage, latitude, longitude],
    queryFn: async () => {
      // Use getRestaurants with pagination parameters and location
      const result = await restaurantsApi.getRestaurants({
        page: currentPage,
        limit: 12,
        location:
          latitude && longitude ? `${latitude},${longitude}` : undefined,
      });
      return {
        restaurants: result,
        hasMore: result.length === 12, // Assume more if we got exactly 12
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    enabled: hasMore && shouldFetch,
  });

  // Update restaurants when new data arrives
  useEffect(() => {
    if (restaurantsData) {
      if (currentPage === 1) {
        // First page - replace all restaurants
        setAllRestaurants(restaurantsData.restaurants);
        setMobileDisplayCount(5); // Reset mobile display count
      } else {
        // Subsequent pages - append to existing restaurants, avoiding duplicates
        setAllRestaurants((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newRestaurants = restaurantsData.restaurants.filter(
            (r) => !existingIds.has(r.id)
          );

          // If no new restaurants, it might be because the API returned duplicates
          // In this case, we should still update hasMore to false to stop pagination
          if (newRestaurants.length === 0) {
            // Set hasMore to false to stop pagination
            setHasMore(false);
          }

          return [...prev, ...newRestaurants];
        });
      }
      setHasMore(restaurantsData.hasMore);

      setIsLoadingMore(false);
      setIsInitialLoading(false);
    }
  }, [restaurantsData, currentPage]);

  // Load more restaurants
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);

      // On mobile, increase the display count to show more restaurants
      if (isMobile) {
        setMobileDisplayCount((prev) => prev + 5);
      }
    }
  }, [isLoadingMore, hasMore, isLoading, isMobile]);

  // Fetch categories from API
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesQuery();

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    setAuthMode(originalMode);
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
  };

  const handleAllRestaurantClick = () => {
    navigate('/category/all');
  };

  const handleCategoryClick = (category: {
    name: string;
    filter?: string | null;
  }) => {
    if (category.name === 'All Restaurant') {
      navigate('/category/all');
    } else if (category.filter) {
      // Navigate to /category/all with filter parameter
      const searchParams = new URLSearchParams();
      searchParams.set('filter', category.filter);
      navigate(`/category/all?${searchParams.toString()}`);
    } else {
      setSelectedCategory(category.filter || null);
    }
  };

  const handleFooterCategoryClick = (filter: string) => {
    if (filter === 'all') {
      navigate('/category/all');
    } else {
      navigate(`/category/${filter}`);
    }
  };

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Filter restaurants based on search query and category
  const filteredRestaurants = useMemo(() => {
    // When searching, use search results; otherwise use paginated restaurants
    if (searchQuery.trim()) {
      if (searchResults && searchResults.length > 0) {
        // Use search results and apply search filter
        return searchResults.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.place.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else if (!isSearching) {
        // Fallback: search in loaded restaurants if search API didn't return results
        return allRestaurants.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.place.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // Still searching, return empty array
        return [];
      }
    }

    // No search query - use normal pagination logic
    let filtered = allRestaurants;

    // Apply category filter (only if a specific category is selected)
    // If selectedCategory is null (All Restaurant), show all restaurants without filtering
    if (selectedCategory) {
      filtered = filtered.filter((restaurant) => {
        switch (selectedCategory) {
          case 'nearby': {
            // Filter by distance - use calculated distance
            const distance = getRestaurantDistance(
              restaurant,
              latitude && longitude ? { latitude, longitude } : null
            );
            if (distance !== null) {
              return distance <= 5; // Within 5km
            }
            // If no distance data available, show restaurant (fallback)
            return true;
          }
          case 'discount':
            // Filter by price range (assuming lower price range indicates discounts)
            return (
              restaurant.priceRange &&
              restaurant.priceRange.min <= 20 &&
              restaurant.priceRange.max <= 50
            );
          case 'bestseller':
            // Filter by high rating (4.5+ stars)
            return restaurant.star && restaurant.star >= 4.5;
          case 'delivery':
            // Filter by delivery availability (assuming all restaurants have delivery)
            return true; // All restaurants have delivery in this case
          case 'lunch':
            // Filter by meal type (this would need more specific data)
            return true; // For now, show all restaurants
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [
    allRestaurants,
    searchResults,
    searchQuery,
    selectedCategory,
    latitude,
    longitude,
    isSearching,
  ]);

  return (
    <div className='bg-white font-nunito'>
      {/* Hero Section */}
      <div className='relative h-[648px] md:hero-height' style={{ zIndex: 1 }}>
        {/* Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: `url(${bgMainpage})`,
          }}
        />

        {/* Gradient Overlay */}
        <div className='absolute inset-0 hero-gradient' style={{ zIndex: 2 }} />

        {/* Hero Content */}
        <div
          className='relative flex flex-col items-center justify-center h-full px-4'
          style={{ zIndex: 3 }}
        >
          <div className='text-center max-w-[349px] md:max-w-4xl'>
            <h1 className='text-[36px] md:text-display-2xl text-white mb-1 md:mb-2 leading-[44px] md:leading-tight font-nunito font-extrabold'>
              Explore Culinary Experiences
            </h1>
            <p className='text-[18px] md:text-display-xs text-white mb-6 md:mb-10 leading-[32px] md:leading-[36px] font-nunito font-bold tracking-[-0.03em]'>
              Search and refine your choice to discover the perfect restaurant.
            </p>

            {/* Search Bar */}
            <div className='flex items-center bg-white rounded-full px-4 py-2 md:px-6 md:py-3 w-full md:max-w-2xl mx-auto h-12 md:h-auto'>
              <Search className='w-5 h-5 md:w-5 md:h-5 text-gray-500 mr-1.5 md:mr-3' />
              <input
                type='text'
                placeholder='Search restaurants, food and drink'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='flex-1 text-gray-600 placeholder-gray-500 outline-none text-sm md:text-md-regular font-nunito font-normal leading-7 tracking-[-0.02em]'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div id='categories-section' className='py-16 px-4 md:px-30'>
        <div className='max-w-[393px] md:max-w-6xl mx-auto'>
          {categoriesLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
            </div>
          ) : categoriesError ? (
            <div className='text-center py-8'>
              <p className='text-red-600'>Failed to load categories</p>
            </div>
          ) : (
            <div className='flex flex-wrap justify-center gap-5 md:gap-8'>
              {categories.map((category, index) => {
                const isActive = selectedCategory === category.filter;

                return (
                  <div
                    key={category.id || index}
                    className='flex flex-col items-center gap-1 md:gap-2 cursor-pointer hover:opacity-80 transition-opacity w-[106px] md:w-auto'
                    onClick={() => {
                      handleCategoryClick(category);
                    }}
                  >
                    <div
                      className={`w-[106px] h-[100px] md:w-40 md:h-25 rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] flex items-center justify-center overflow-hidden transition-colors p-2 ${
                        isActive
                          ? 'bg-orange-100 border-2 border-orange-500'
                          : 'bg-white'
                      }`}
                    >
                      <img
                        src={category.icon}
                        alt={category.name}
                        className='w-12 h-12 md:w-16 md:h-16 object-contain'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm md:text-lg-bold font-bold text-center leading-7 tracking-[-0.02em] font-nunito ${
                        isActive ? 'text-orange-600' : 'text-[#0A0D12]'
                      }`}
                    >
                      {category.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Restaurants Section */}
      <div className='py-16 px-4 md:px-30 bg-gray-50'>
        <div className='max-w-[393px] md:max-w-6xl mx-auto'>
          {/* Section Header */}
          <div className='flex justify-between items-center mb-4 md:mb-8'>
            <div className='flex items-center gap-4'>
              <h2 className='text-2xl md:text-display-md text-[#0A0D12] font-nunito font-extrabold leading-9 md:leading-[42px]'>
                Recommended
              </h2>
              {selectedCategory && (
                <div className='hidden md:flex items-center gap-2'>
                  <span className='text-sm text-gray-600'>
                    Filtered by:{' '}
                    {
                      categories.find((cat) => cat.filter === selectedCategory)
                        ?.name
                    }
                  </span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className='text-sm text-red-600 hover:text-red-700 underline'
                  >
                    Clear Filter
                  </button>
                </div>
              )}
              {selectedCategory === 'nearby' && locationError && (
                <div className='hidden md:flex items-center gap-2'>
                  <span className='text-sm text-orange-600'>
                    Location unavailable - showing all restaurants
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleAllRestaurantClick}
              className='text-base md:text-lg-bold text-[#C12116] hover:text-red-700 font-nunito font-extrabold leading-[30px] md:leading-normal'
            >
              See All
            </button>
          </div>

          {/* Loading State */}
          {(isInitialLoading || (searchQuery.trim() && isSearching)) && (
            <div className='flex justify-center items-center py-16'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500'></div>
              {searchQuery.trim() && isSearching && (
                <p className='ml-4 text-gray-600'>Searching restaurants...</p>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='text-center py-16'>
              <p className='text-red-600 text-lg'>
                Failed to load restaurants. Please try again later.
              </p>
            </div>
          )}

          {/* No Results */}
          {!isInitialLoading &&
            !error &&
            !(searchQuery.trim() && isSearching) &&
            filteredRestaurants.length === 0 && (
              <div className='text-center py-16'>
                <p className='text-gray-600 text-lg'>
                  {searchQuery
                    ? 'No restaurants found matching your search.'
                    : 'No recommended restaurants available.'}
                </p>
              </div>
            )}

          {/* Restaurant Grid */}
          {!isInitialLoading &&
            !error &&
            !(searchQuery.trim() && isSearching) &&
            filteredRestaurants.length > 0 && (
              <>
                <div className='flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-5 mb-8'>
                  {filteredRestaurants
                    .slice(
                      0,
                      searchQuery.trim()
                        ? filteredRestaurants.length // Show all search results
                        : isMobile
                        ? mobileDisplayCount
                        : filteredRestaurants.length
                    )
                    .map((restaurant, index) => (
                      <RestaurantCard
                        key={`${restaurant.id}-${index}`}
                        restaurant={restaurant}
                        userLocation={
                          latitude && longitude ? { latitude, longitude } : null
                        }
                      />
                    ))}
                </div>

                {/* Show More Button - Only show when not searching */}
                {!searchQuery.trim() && (
                  <ShowMoreButton
                    isExpanded={false}
                    onToggle={loadMore}
                    showButton={
                      hasMore &&
                      allRestaurants.length > 0 &&
                      (!isMobile ||
                        mobileDisplayCount < filteredRestaurants.length)
                    }
                    expandedText='Show More'
                    collapsedText='Show More'
                    disabled={isLoadingMore}
                    className='py-8'
                  />
                )}

                {/* End of results indicator - Only show when not searching */}
                {!searchQuery.trim() &&
                  !hasMore &&
                  allRestaurants.length > 0 && (
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

      {/* Footer */}
      <Footer
        onCategoryClick={handleFooterCategoryClick}
        onScrollToCategories={scrollToCategories}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialMode={authMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

export default HomePage;

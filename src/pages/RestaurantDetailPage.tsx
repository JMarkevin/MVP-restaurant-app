import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '@/services/api/restaurants';
import {
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/services/queries/reviews';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getRestaurantDistance, formatDistance } from '@/utils/distance';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem, updateQuantity } from '@/features/cart/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import type { RootState } from '@/app/store';
import type { MenuItem, Review } from '@/types';
import MenuCard from '@/components/MenuCard';
import CheckoutBar from '@/components/CheckoutBar';
import ReviewCard from '@/ui/review-card';
import Footer from '@/components/Footer';
import ShowMoreButton from '@/components/ShowMoreButton';
import ImageWithFallback from '@/components/ImageWithFallback';

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [selectedMenuFilter, setSelectedMenuFilter] = useState<
    'all' | 'food' | 'drink'
  >('all');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMoreReviews, setShowMoreReviews] = useState(false);

  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Review mutations
  const updateReviewMutation = useUpdateReviewMutation();
  const deleteReviewMutation = useDeleteReviewMutation();

  // Cache invalidation is handled by mutations automatically

  // Fetch restaurant details
  const {
    data: restaurant,
    isLoading: restaurantLoading,
    error: restaurantError,
  } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantsApi.getRestaurantById(id!),
    enabled: !!id,
  });

  // Fetch restaurant menus
  const { data: menus = [] } = useQuery({
    queryKey: ['restaurant-menus', id],
    queryFn: () => restaurantsApi.getRestaurantMenus(id!),
    enabled: !!id,
  });

  // Extract reviews from the restaurant data (API already includes reviews)
  const reviews = restaurant?.reviews || [];

  // Calculate distance
  const distance = restaurant
    ? getRestaurantDistance(
        restaurant,
        latitude && longitude ? { latitude, longitude } : null
      )
    : null;

  // Map API menu data to our expected format and filter
  const mappedMenus: MenuItem[] = menus.map(
    (menu: Record<string, unknown>) => ({
      id: String(menu.id),
      name: String(menu.foodName || menu.name),
      price: Number(menu.price),
      category: String(
        menu.type === 'side' || menu.type === 'dessert' ? 'food' : menu.type
      ),
      restaurantId: id || '',
      image: String(menu.image || ''),
    })
  );

  // Filter menus based on selected filter
  const filteredMenus = mappedMenus.filter((menu: MenuItem) => {
    if (selectedMenuFilter === 'all') return true;
    if (selectedMenuFilter === 'food') return menu.category === 'food';
    if (selectedMenuFilter === 'drink') return menu.category === 'drink';
    return true;
  });

  // Fallback data for testing if API doesn't return data
  const fallbackMenus: MenuItem[] = [
    {
      id: '1',
      name: 'Burger Deluxe',
      price: 50000,
      category: 'food',
      restaurantId: id || '',
      image: '/src/assets/images/menu-placeholder.jpg',
    },
    {
      id: '2',
      name: 'Spaghetti Carbonara',
      price: 45000,
      category: 'food',
      restaurantId: id || '',
      image: '/src/assets/images/menu-placeholder.jpg',
    },
    {
      id: '3',
      name: 'Coca Cola',
      price: 15000,
      category: 'drink',
      restaurantId: id || '',
      image: '/src/assets/images/menu-placeholder.jpg',
    },
  ];

  // Use fallback data if API doesn't return data
  const displayMenus = filteredMenus.length > 0 ? filteredMenus : fallbackMenus;

  // Use reviews from the dedicated reviews API call only
  const displayReviews = reviews || [];

  // Get cart quantity for a menu item
  const getCartQuantity = (menuId: string) => {
    const cartItem = cartItems.find((item) => item.id === menuId);
    return cartItem?.quantity || 0;
  };

  // Handle add to cart
  const handleAddToCart = (menu: MenuItem) => {
    dispatch(
      addItem({
        id: menu.id,
        name: menu.name,
        price: menu.price,
        image: menu.image,
        restaurantId: id!,
        restaurantName: restaurant?.name || '',
      })
    );
  };

  // Handle quantity change
  const handleQuantityChange = (menuId: string, change: number) => {
    const currentQuantity = getCartQuantity(menuId);
    const newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
      dispatch(removeItem(menuId));
    } else {
      dispatch(updateQuantity({ id: menuId, quantity: newQuantity }));
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant?.name,
          text: `Check out ${restaurant?.name} on Foody!`,
          url: window.location.href,
        });
      } catch {
        // Error sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Handle review edit
  const handleEditReview = async (review: Review) => {
    try {
      await updateReviewMutation.mutateAsync({
        reviewId: review.id,
        data: {
          star: review.star || review.rating || 5,
          comment: review.comment || '',
        },
      });
      // The mutation will handle cache invalidation automatically
    } catch (error) {
      console.error('Failed to update review:', error);
      alert('Failed to update review. Please try again.');
    }
  };

  // Handle review delete
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      // The mutation will handle cache invalidation automatically
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  // Check if current user is the review author
  const isCurrentUserReview = (review: Review) => {
    // Get the current user ID from auth context
    const currentUserId = user?.id;
    if (!currentUserId || !review.user?.id) {
      return false;
    }
    // Compare user IDs (handle both string and number types)
    return String(review.user.id) === String(currentUserId);
  };

  // Get available images for gallery
  const getAvailableImages = () => {
    const images = [];
    if (restaurant?.images?.[0]) images.push(restaurant.images[0]);
    if (restaurant?.images?.[1]) images.push(restaurant.images[1]);
    if (restaurant?.images?.[2]) images.push(restaurant.images[2]);
    if (restaurant?.images?.[3]) images.push(restaurant.images[3]);
    if (restaurant?.logo) images.push(restaurant.logo);

    // If no images, add placeholder
    if (images.length === 0) {
      images.push('/src/assets/images/restaurant-placeholder.jpg');
    }

    return images;
  };

  const availableImages = getAvailableImages();

  // Drag handlers for image gallery
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragCurrentX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const dragDistance = dragCurrentX - dragStartX;
    const threshold = 50; // Minimum drag distance to trigger slide

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0 && currentImageIndex > 0) {
        // Swipe right - go to previous image
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (
        dragDistance < 0 &&
        currentImageIndex < availableImages.length - 1
      ) {
        // Swipe left - go to next image
        setCurrentImageIndex(currentImageIndex + 1);
      }
    }

    setIsDragging(false);
    setDragStartX(0);
    setDragCurrentX(0);
  };

  // Prevent default touch behavior
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e);
  };

  // Auto-advance images (optional)
  useEffect(() => {
    if (availableImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === availableImages.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [availableImages.length]);

  if (restaurantLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto'></div>
          <p className='mt-4 text-lg'>Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (restaurantError || !restaurant) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Restaurant not found
          </h1>
          <button
            onClick={() => navigate('/')}
            className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700'
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Main Content */}
      <div className='px-4 py-4 pt-20 pb-20 md:px-30 md:py-8 md:pt-24 md:pb-8 w-full max-w-[393px] md:max-w-none md:w-[1440px] mx-auto'>
        {/* Photo Gallery */}
        <div className='mb-4 md:mb-8'>
          {/* Mobile: Draggable Image Gallery with Pagination Dots */}
          <div className='md:hidden'>
            <div className='flex flex-col items-center gap-3'>
              {/* Image Container */}
              <div
                ref={galleryRef}
                className='w-[361px] h-[260.63px] relative overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing'
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
              >
                {/* Image with drag transform */}
                <div
                  className='w-full h-full transition-transform duration-200 ease-out'
                  style={{
                    transform: isDragging
                      ? `translateX(${dragCurrentX - dragStartX}px)`
                      : 'translateX(0)',
                  }}
                >
                  <ImageWithFallback
                    src={availableImages[currentImageIndex]}
                    alt={restaurant.name}
                    className='w-full h-full object-cover rounded-2xl'
                    fallbackText='No Image Available'
                  />
                </div>

                {/* Drag indicator overlay */}
                {isDragging && (
                  <div className='absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center'>
                    <div className='text-white text-sm font-medium'>
                      {dragCurrentX > dragStartX ? '← Previous' : 'Next →'}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination Dots */}
              <div className='flex items-center gap-1'>
                {availableImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentImageIndex
                        ? 'bg-[#C12116]'
                        : 'bg-[#D9D9D9]'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Multi-Image Gallery */}
          <div className='hidden md:block'>
            <div className='flex gap-5' style={{ height: '470px' }}>
              {/* Main Image */}
              <div style={{ width: '651px' }}>
                <ImageWithFallback
                  src={
                    restaurant.images?.[0] ||
                    restaurant.logo ||
                    '/src/assets/images/restaurant-placeholder.jpg'
                  }
                  alt={restaurant.name}
                  className='w-full h-full object-cover rounded-2xl'
                  fallbackText='No Image Available'
                />
              </div>

              {/* Right Side Images */}
              <div className='flex flex-col gap-5 flex-1'>
                {/* Top Image */}
                <div style={{ height: '302px' }}>
                  <ImageWithFallback
                    src={
                      restaurant.images?.[1] ||
                      restaurant.logo ||
                      '/src/assets/images/restaurant-placeholder.jpg'
                    }
                    alt={restaurant.name}
                    className='w-full h-full object-cover rounded-2xl'
                    fallbackText='No Image'
                  />
                </div>

                {/* Bottom Two Images */}
                <div className='flex gap-5' style={{ height: '148px' }}>
                  <div className='flex-1'>
                    <ImageWithFallback
                      src={
                        restaurant.images?.[2] ||
                        restaurant.logo ||
                        '/src/assets/images/restaurant-placeholder.jpg'
                      }
                      alt={restaurant.name}
                      className='w-full h-full object-cover rounded-2xl'
                      fallbackText='No Image'
                    />
                  </div>
                  <div className='flex-1'>
                    <ImageWithFallback
                      src={
                        restaurant.images?.[3] ||
                        restaurant.logo ||
                        '/src/assets/images/restaurant-placeholder.jpg'
                      }
                      alt={restaurant.name}
                      className='w-full h-full object-cover rounded-2xl'
                      fallbackText='No Image'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className='mb-4 md:mb-8'>
          {/* Mobile: Frame 108 Layout */}
          <div className='md:hidden'>
            <div
              className='flex flex-row justify-between items-start px-0 gap-[60px]'
              style={{ width: '361px', minHeight: '90px' }}
            >
              {/* Frame 107 - Centered Content */}
              <div
                className='flex flex-row items-start px-0 gap-2 mx-auto'
                style={{ width: '246px', minHeight: '90px' }}
              >
                {/* Restaurant Logo - Rectangle 3 */}
                <div
                  className='rounded-full flex-none order-0 flex-grow-0'
                  style={{ width: '90px', height: '90px' }}
                >
                  <ImageWithFallback
                    src={
                      restaurant.logo ||
                      '/src/assets/images/restaurant-placeholder.jpg'
                    }
                    alt={restaurant.name}
                    className='w-full h-full object-cover rounded-full'
                    fallbackText='No Logo'
                  />
                </div>

                {/* Frame 2 - Restaurant Details */}
                <div
                  className='flex flex-col items-start px-0 gap-0.5 flex-none order-1 flex-grow-0'
                  style={{ width: '148px', minHeight: '90px' }}
                >
                  {/* Restaurant Name - Burger King */}
                  <h1
                    className='font-nunito font-extrabold text-[#0A0D12] leading-[20px] flex-none order-0 self-stretch flex-grow-0 break-words'
                    style={{
                      fontSize: '16px',
                      width: '148px',
                      minHeight: '20px',
                      lineHeight: '20px',
                    }}
                  >
                    {restaurant.name}
                  </h1>

                  {/* Frame 1 - Rating Row */}
                  <div
                    className='flex flex-row items-center px-0 gap-1 flex-none order-1 self-stretch flex-grow-0 mt-1'
                    style={{ width: '148px', height: '28px' }}
                  >
                    {/* Star Icon */}
                    <div className='w-6 h-6 flex-none order-0 flex-grow-0'>
                      <Star className='w-6 h-6 text-[#FFAB0D] fill-current' />
                    </div>

                    {/* Rating Text */}
                    <span
                      className='font-nunito font-medium text-[#0A0D12] text-center flex-none order-1 flex-grow-0'
                      style={{
                        fontSize: '14px',
                        lineHeight: '28px',
                        width: '21px',
                        height: '28px',
                      }}
                    >
                      {restaurant.star?.toFixed(1) || 'N/A'}
                    </span>
                  </div>

                  {/* Frame 7 - Location and Distance Row */}
                  <div
                    className='flex flex-row items-center px-0 gap-1.5 flex-none order-2 self-stretch flex-grow-0'
                    style={{ width: '148px', height: '28px' }}
                  >
                    {/* Location */}
                    <span
                      className='font-nunito font-normal text-[#0A0D12] flex-none order-0 flex-grow-0'
                      style={{
                        fontSize: '14px',
                        lineHeight: '28px',
                        letterSpacing: '-0.02em',
                        width: '92px',
                        height: '28px',
                      }}
                    >
                      {restaurant.place}
                    </span>

                    {/* Dot Separator */}
                    <div
                      className='bg-[#0A0D12] rounded-full flex-none order-1 flex-grow-0'
                      style={{ width: '2px', height: '2px' }}
                    ></div>

                    {/* Distance */}
                    <span
                      className='font-nunito font-normal text-[#0A0D12] flex-none order-2 flex-grow-0 whitespace-nowrap'
                      style={{
                        fontSize: '14px',
                        lineHeight: '28px',
                        letterSpacing: '-0.02em',
                        width: '48px',
                        height: '28px',
                      }}
                    >
                      {formatDistance(distance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <button
                className='flex flex-row justify-center items-center px-4 py-3 gap-3 mx-auto border border-[#D5D7DA] rounded-full flex-none order-1 flex-grow-0'
                style={{ width: '44px', height: '44px' }}
                onClick={handleShare}
              >
                <Share2 className='w-5 h-5 text-[#0A0D12] flex-none order-0 flex-grow-0' />
              </button>
            </div>
          </div>

          {/* Desktop: Original Layout */}
          <div
            className='hidden md:flex items-center gap-4 w-full'
            style={{ height: '120px' }}
          >
            {/* Restaurant Logo */}
            <div
              style={{ width: '120px', height: '120px' }}
              className='rounded-full overflow-hidden'
            >
              <ImageWithFallback
                src={
                  restaurant.logo ||
                  '/src/assets/images/restaurant-placeholder.jpg'
                }
                alt={restaurant.name}
                className='w-full h-full object-cover'
                fallbackText='No Logo'
              />
            </div>

            {/* Restaurant Details */}
            <div className='flex-1'>
              <h1
                className='text-3xl font-extrabold text-gray-900 mb-1'
                style={{ height: '42px', lineHeight: '42px' }}
              >
                {restaurant.name}
              </h1>

              {/* Rating */}
              <div
                className='flex items-center gap-1 mb-2'
                style={{ height: '32px' }}
              >
                <Star className='w-6 h-6 text-yellow-400 fill-current' />
                <span className='text-lg font-semibold text-gray-900'>
                  {restaurant.star?.toFixed(1) || 'N/A'}
                </span>
              </div>

              {/* Location and Distance */}
              <div
                className='flex items-center gap-2'
                style={{ height: '32px' }}
              >
                <span className='text-lg font-medium text-gray-900'>
                  {restaurant.place}
                </span>
                <div className='w-0.5 h-0.5 bg-gray-900 rounded-full'></div>
                <span className='text-lg font-medium text-gray-900'>
                  {formatDistance(distance)}
                </span>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className='flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50'
              style={{ width: '140px', height: '44px' }}
            >
              <Share2 className='w-6 h-6 text-gray-900' />
              <span className='text-base font-bold text-gray-900'>Share</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className='w-full h-px bg-[#D5D7DA] mb-4 md:mb-8'></div>

        {/* Menu Section */}
        <div className='mb-4 md:mb-8'>
          <h2 className='text-2xl md:text-4xl font-extrabold text-[#0A0D12] mb-4 md:mb-6 leading-9 md:leading-none'>
            Menu
          </h2>

          {/* Menu Filters */}
          <div className='flex gap-2 md:gap-3 mb-4 md:mb-6'>
            <button
              onClick={() => setSelectedMenuFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                selectedMenuFilter === 'all'
                  ? 'bg-[#FFECEC] text-[#C12116] border border-[#C12116]'
                  : 'border border-[#D5D7DA] text-[#0A0D12]'
              }`}
            >
              All Menu
            </button>
            <button
              onClick={() => setSelectedMenuFilter('food')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                selectedMenuFilter === 'food'
                  ? 'bg-[#FFECEC] text-[#C12116] border border-[#C12116]'
                  : 'border border-[#D5D7DA] text-[#0A0D12]'
              }`}
            >
              Food
            </button>
            <button
              onClick={() => setSelectedMenuFilter('drink')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                selectedMenuFilter === 'drink'
                  ? 'bg-[#FFECEC] text-[#C12116] border border-[#C12116]'
                  : 'border border-[#D5D7DA] text-[#0A0D12]'
              }`}
            >
              Drink
            </button>
          </div>

          {/* Checkout Bar */}
          <CheckoutBar />

          {/* Menu Grid */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-4 md:mb-6 mt-4 md:mt-8'>
            {displayMenus
              .slice(0, showMoreMenu ? displayMenus.length : 8)
              .map((menu: MenuItem) => {
                const quantity = getCartQuantity(menu.id);
                return (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    quantity={quantity}
                    onAddToCart={handleAddToCart}
                    onQuantityChange={handleQuantityChange}
                  />
                );
              })}
          </div>

          {/* Show More Button */}
          <ShowMoreButton
            isExpanded={showMoreMenu}
            onToggle={() => setShowMoreMenu(!showMoreMenu)}
            showButton={displayMenus.length > 8}
            expandedText='Show Less'
            collapsedText='Show More'
            className='mb-4 md:mb-6'
          />
        </div>

        {/* Divider */}
        <div className='w-full h-px bg-[#D5D7DA] mb-4 md:mb-8'></div>

        {/* Reviews Section */}
        <div className='mb-4 md:mb-8'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-1 mb-4 md:mb-6'>
            <h2 className='text-2xl md:text-4xl font-extrabold text-[#0A0D12] leading-9 md:leading-none'>
              Reviews
            </h2>
            <div className='flex items-center gap-1'>
              <Star className='w-6 h-6 md:w-8 md:h-8 text-[#FFAB0D] fill-current' />
              <span className='text-base md:text-4xl font-extrabold text-[#0A0D12] leading-7 md:leading-none'>
                {restaurant.star?.toFixed(1) || 'N/A'} ({displayReviews.length}{' '}
                Ulasan)
              </span>
            </div>
          </div>

          {/* Reviews Grid */}
          {displayReviews.length > 0 ? (
            <div className='flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-6'>
              {displayReviews
                .slice(0, showMoreReviews ? displayReviews.length : 6)
                .map((review: Review, index: number) => (
                  <ReviewCard
                    key={review.id || index}
                    review={review}
                    isCurrentUser={isCurrentUserReview(review)}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                    isDeleting={deleteReviewMutation.isPending}
                  />
                ))}
            </div>
          ) : (
            <div className='text-center py-8 md:py-12'>
              <div className='text-gray-500 text-sm md:text-lg'>
                No reviews yet. Be the first to review this restaurant!
              </div>
            </div>
          )}

          {/* Show More Reviews Button */}
          <ShowMoreButton
            isExpanded={showMoreReviews}
            onToggle={() => setShowMoreReviews(!showMoreReviews)}
            showButton={displayReviews.length > 6}
            expandedText='Show Less'
            collapsedText='Show More'
            className='mb-4 md:mb-6'
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;

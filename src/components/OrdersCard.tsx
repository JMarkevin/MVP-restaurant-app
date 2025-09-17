import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '@/services/api/orders';
import {
  useCreateReviewMutation,
  useMyReviewsQuery,
} from '@/services/queries/reviews';
import { useMenuImages } from '@/hooks/useMenuImages';
import { useAuth } from '@/hooks/useAuth';
import ReviewModal from './ReviewModal';
import restaurantIcon from '/restaurant-icon.png';
import type { RootState } from '@/app/store';
import type { Order } from '@/features/orders/ordersSlice';

const OrdersCard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('done');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    transactionId?: string;
    restaurantName: string;
    restaurantId?: number;
  } | null>(null);

  // Touch sliding state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const statusContainerRef = useRef<HTMLDivElement>(null);

  // Get orders from Redux store (contains actual checkout data with images)
  const reduxOrders = useSelector((state: RootState) => state.orders.orders);

  // Fetch orders from API
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () =>
      ordersApi.getMyOrders(statusFilter === 'done' ? undefined : statusFilter),
    staleTime: 30000, // 30 seconds
    enabled: isAuthenticated, // Only fetch when user is authenticated
    retry: (failureCount, error) => {
      // Don't retry on 401 errors to prevent loops
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Use the menu images hook
  const { menuImages } = useMenuImages(ordersData);

  // Review mutation
  const createReviewMutation = useCreateReviewMutation();

  // Fetch user's reviews to check which restaurants have been reviewed (only when authenticated)
  const { data: myReviewsData } = useMyReviewsQuery(
    { page: 1, limit: 100 },
    { enabled: isAuthenticated }
  );

  // Helper function to check if restaurant has already been reviewed
  const hasReviewedRestaurant = (restaurantId: number) => {
    if (!myReviewsData?.reviews) return false;
    return myReviewsData.reviews.some(
      (review) => Number(review.restaurant?.id) === Number(restaurantId)
    );
  };

  // Touch sliding handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!statusContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - statusContainerRef.current.offsetLeft);
    setScrollLeft(statusContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !statusContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - statusContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    statusContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!statusContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - statusContainerRef.current.offsetLeft);
    setScrollLeft(statusContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !statusContainerRef.current) return;
    const x = e.touches[0].pageX - statusContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    statusContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Navigation handler
  const handleRestaurantClick = (restaurantId: number) => {
    navigate(`/restaurants/${restaurantId}`);
  };

  // Modal handlers
  const handleOpenReviewModal = (order: {
    id: string;
    restaurantName: string;
    restaurantId?: number;
  }) => {
    setSelectedOrder(order);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedOrder || !selectedOrder.restaurantId) {
      console.error('Missing order data:', { selectedOrder });
      alert('Unable to submit review: Missing order information');
      return;
    }

    try {
      // Ensure we have a valid transaction ID
      const transactionId = selectedOrder.transactionId || selectedOrder.id;

      if (!transactionId) {
        console.error('Missing transaction ID:', { selectedOrder });
        alert('Unable to submit review: Missing transaction ID');
        return;
      }

      const reviewData = {
        transactionId: transactionId,
        restaurantId: selectedOrder.restaurantId,
        star: rating,
        comment: comment,
      };

      await createReviewMutation.mutateAsync(reviewData);
      handleCloseReviewModal();
    } catch (error) {
      // Enhanced error handling
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string; details?: string };
        };
      };

      console.error('Review submission error:', {
        error,
        response: axiosError.response,
        selectedOrder,
      });

      if (
        axiosError.response?.status === 409 ||
        axiosError.response?.data?.message?.includes('already reviewed')
      ) {
        alert('You have already reviewed this restaurant!');
      } else if (
        axiosError.response?.status === 400 &&
        (axiosError.response?.data?.message?.includes(
          'only review restaurants you have ordered from'
        ) ||
          axiosError.response?.data?.message?.includes('Transaction not found'))
      ) {
        alert('You can only review restaurants you have ordered from!');
      } else if (axiosError.response?.status === 401) {
        alert('Please log in to submit a review');
      } else if (
        axiosError.response?.status === 404 ||
        axiosError.response?.data?.message?.includes('Transaction not found') ||
        axiosError.response?.data?.message?.includes('does not belong to you')
      ) {
        alert(
          'This order was not found or does not belong to you. Please try refreshing the page.'
        );
      } else {
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.details ||
          'Unknown error occurred';
        alert(`Failed to submit review: ${errorMessage}`);
      }
    }
  };

  // Prioritize API orders over Redux orders for reviews (API orders have valid transaction IDs)
  const mappedOrders =
    ordersData?.data.orders.map((apiOrder) => {
      const firstRestaurant = apiOrder.restaurants[0];
      const restaurantId = Number(firstRestaurant?.restaurantId) || 1;
      return {
        id: apiOrder.id.toString(),
        transactionId: apiOrder.transactionId, // Use actual transaction ID from API
        restaurantName: firstRestaurant?.restaurantName || 'Restaurant',
        restaurantId: restaurantId, // Convert to number, default to 1 if not available
        restaurantLogo: '', // API doesn't provide logo in this structure
        status: apiOrder.status,
        items:
          firstRestaurant?.items.map((item) => {
            return {
              id: item.menuId.toString(),
              name: item.menuName,
              quantity: item.quantity,
              price: item.price,
              image:
                (item as { image?: string }).image ||
                menuImages[item.menuId.toString()] ||
                `data:image/svg+xml;base64,${btoa(
                  `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F3F4F6"/><text x="40" y="45" text-anchor="middle" font-family="Arial" font-size="24" fill="#6B7280">${item.menuName
                    .charAt(0)
                    .toUpperCase()}</text></svg>`
                )}`, // Use API image, fetched menu image, or SVG placeholder
            };
          }) || [],
        total: apiOrder.pricing.totalPrice,
        orderDate: apiOrder.createdAt,
      };
    }) || [];

  // If no API orders but have Redux orders, map them but mark them as non-reviewable
  const fallbackReduxOrders =
    mappedOrders.length === 0 && reduxOrders.length > 0
      ? reduxOrders.map((order: Order) => {
          const restaurantId = Number(order.restaurantId) || 1;
          return {
            id: order.id,
            transactionId: undefined, // No valid transaction ID for local orders
            restaurantName: order.restaurantName || 'Restaurant',
            restaurantId: restaurantId,
            restaurantLogo: '',
            status: order.status || 'done',
            items: order.items.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image:
                item.imageUrl ||
                `data:image/svg+xml;base64,${btoa(
                  `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#F3F4F6"/><text x="40" y="45" text-anchor="middle" font-family="Arial" font-size="24" fill="#6B7280">${item.name
                    .charAt(0)
                    .toUpperCase()}</text></svg>`
                )}`,
            })),
            total: order.totalAmount,
            orderDate: order.orderDate || new Date().toISOString(),
            isLocalOrder: true, // Flag to indicate this is a local order
          };
        })
      : [];

  // Combine API orders with fallback Redux orders
  const allMappedOrders = [...mappedOrders, ...fallbackReduxOrders];

  // Filter orders by search
  const filteredOrders = allMappedOrders.filter((order) => {
    const matchesSearch =
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  // Format currency
  const formatCurrency = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Use filtered orders
  const displayOrders = filteredOrders;

  const statusFilters = [
    { key: 'preparing', label: 'Preparing' },
    { key: 'on-the-way', label: 'On the Way' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'done', label: 'Done' },
    { key: 'canceled', label: 'Canceled' },
  ];

  return (
    <>
      {/* My Orders Title */}
      <h1 className='text-2xl md:text-3xl font-extrabold text-[#0A0D12] mb-4 md:mb-6 leading-9 md:leading-tight font-nunito'>
        My Orders
      </h1>

      {/* Main Orders Container - Frame 93 */}
      <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 md:p-6 w-[361px] md:w-full h-auto md:h-[734px] flex flex-col items-start gap-5 md:gap-5'>
        {/* Search Bar - Search Large */}
        <div className='flex flex-row items-center px-4 py-2 gap-1.5 w-full max-w-[329px] md:max-w-[598px] h-11 bg-white border border-[#D5D7DA] rounded-full'>
          <Search className='w-5 h-5 text-gray-500' />
          <input
            type='text'
            placeholder='Search'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-7 font-nunito font-normal text-sm leading-7 tracking-[-0.02em] text-[#535862] border-none outline-none bg-transparent'
          />
        </div>

        {/* Status Filters - Container */}
        <div
          ref={statusContainerRef}
          className={`flex flex-row items-center p-0 gap-3 w-full max-w-[329px] md:max-w-[620px] h-16 md:h-44 overflow-hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ userSelect: 'none' }}
        >
          {/* Status Label */}
          <span className='text-base md:text-lg font-bold text-[#0A0D12] font-nunito leading-8 tracking-[-0.03em] flex-none'>
            Status
          </span>

          {/* Filter Buttons */}
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => {
                if (!isDragging) {
                  setStatusFilter(filter.key);
                }
              }}
              className={`flex flex-row justify-center items-center px-4 py-2 gap-2 h-8 md:h-10 min-w-fit whitespace-nowrap rounded-full transition-all duration-200 flex-shrink-0 ${
                isDragging ? 'cursor-grabbing' : 'cursor-pointer'
              } ${
                statusFilter === filter.key
                  ? 'bg-[#FFECEC] border border-[#C12116]'
                  : 'bg-white border border-[#D5D7DA] hover:bg-[#F9FAFB]'
              }`}
            >
              <span
                className={`font-nunito text-sm md:text-base leading-tight tracking-[-0.02em] flex items-center justify-center whitespace-nowrap text-center ${
                  statusFilter === filter.key
                    ? 'font-bold text-[#C12116]'
                    : 'font-semibold text-[#0A0D12]'
                }`}
              >
                {filter.label}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className='flex flex-col items-start p-0 gap-4 w-full h-auto max-h-[400px] md:max-h-[600px] overflow-y-auto'>
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                width: '100%',
                height: '200px',
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0px 0px 20px rgba(203, 202, 202, 0.25)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#717680',
                  textAlign: 'center',
                }}
              >
                Loading orders...
              </span>
            </div>
          ) : error ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                width: '100%',
                height: '200px',
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0px 0px 20px rgba(203, 202, 202, 0.25)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#717680',
                  textAlign: 'center',
                }}
              >
                Error loading orders
              </span>
            </div>
          ) : displayOrders.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                width: '100%',
                height: '200px',
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0px 0px 20px rgba(203, 202, 202, 0.25)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#717680',
                  textAlign: 'center',
                }}
              >
                No orders found
              </span>
            </div>
          ) : (
            displayOrders.map((order, index) => (
              <div
                key={order.id}
                className='flex flex-col items-start p-4 md:p-5 gap-4 w-full md:w-[95%] h-auto md:h-[268px] bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] rounded-2xl mx-auto'
                style={{
                  marginTop: index === 0 ? '20px' : '0px',
                  marginBottom:
                    index === displayOrders.length - 1 ? '20px' : '0px',
                }}
              >
                {/* Restaurant Header - Frame 49 */}
                <div className='flex flex-row items-center p-0 gap-2 w-auto h-8'>
                  {/* Restaurant Logo */}
                  <div className='w-8 h-8 bg-transparent rounded-lg flex items-center justify-center overflow-hidden'>
                    <img
                      src={restaurantIcon}
                      alt={order.restaurantName}
                      className='w-full h-full object-cover rounded-lg'
                      onError={() => {
                        // Restaurant logo failed to load
                      }}
                    />
                  </div>
                  {/* Restaurant Name */}
                  <span
                    onClick={() => handleRestaurantClick(order.restaurantId)}
                    className='text-base md:text-lg font-bold text-[#0A0D12] font-nunito leading-8 tracking-[-0.03em] cursor-pointer transition-colors hover:text-[#C12116]'
                  >
                    {order.restaurantName}
                  </span>
                </div>

                {/* Order Items - Cart List */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center p-0 gap-5 w-full min-h-[88px]'>
                  {/* Item Details - Frame 46 */}
                  <div className='flex flex-row items-center p-0 gap-4 flex-1 min-h-[80px] w-full md:w-auto'>
                    {/* Item Image */}
                    <div className='w-16 h-16 md:w-20 md:h-20 bg-[#F3F4F6] rounded-xl flex items-center justify-center overflow-hidden flex-none'>
                      <div className='w-full h-full bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] rounded-xl flex items-center justify-center text-lg md:text-2xl font-bold text-[#6B7280] relative overflow-hidden'>
                        {/* Placeholder text - always rendered as fallback */}
                        <span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10'>
                          {order.items[0]?.name?.charAt(0).toUpperCase() || '?'}
                        </span>

                        {/* Image - overlays placeholder when loaded successfully */}
                        {order.items[0]?.image && (
                          <img
                            src={order.items[0].image}
                            alt={order.items[0]?.name || 'Food Item'}
                            className='w-full h-full object-cover rounded-xl relative z-20'
                            onLoad={() => {
                              // Image loaded successfully
                            }}
                            onError={(e) => {
                              // Image failed to load
                              // Hide the image to show placeholder
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Item Info - Frame 12 */}
                    <div className='flex flex-col items-start p-0 flex-1 min-h-[60px] justify-center'>
                      {/* Item Name */}
                      <span className='text-sm md:text-base font-medium text-[#0A0D12] font-nunito leading-7 tracking-[-0.03em] mb-1'>
                        {order.items[0]?.name || 'Food Item'}
                      </span>
                      {/* Item Price */}
                      <span className='text-sm md:text-base font-extrabold text-[#0A0D12] font-nunito leading-7'>
                        {order.items[0]?.quantity || 1} x{' '}
                        {formatCurrency(order.items[0]?.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Separator Line - Line 7 */}
                <div className='w-full h-px border border-[#D5D7DA]' />

                {/* Total and Action - Frame 50 */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center p-0 gap-5 w-full min-h-[60px]'>
                  {/* Total Info - Frame 12 */}
                  <div className='flex flex-col items-start p-0 flex-1 min-h-[60px] justify-center'>
                    {/* Total Label */}
                    <span className='text-sm md:text-base font-medium text-[#0A0D12] font-nunito leading-7 tracking-[-0.03em] mb-1'>
                      Total
                    </span>
                    {/* Total Amount */}
                    <span className='text-base md:text-xl font-extrabold text-[#0A0D12] font-nunito leading-8'>
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Give Review Button */}
                  {(order as { isLocalOrder?: boolean }).isLocalOrder ? (
                    <button
                      disabled
                      className='flex flex-row justify-center items-center p-2 gap-2 w-full md:w-[240px] h-12 bg-[#A4A7AE] rounded-full border-none cursor-not-allowed'
                      title='Reviews are only available for completed orders'
                    >
                      <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-7 tracking-[-0.02em]'>
                        Review Unavailable
                      </span>
                    </button>
                  ) : hasReviewedRestaurant(order.restaurantId || 0) ? (
                    <button
                      disabled
                      className='flex flex-row justify-center items-center p-2 gap-2 w-full md:w-[240px] h-12 bg-[#A4A7AE] rounded-full border-none cursor-not-allowed'
                      title='You have already reviewed this restaurant'
                    >
                      <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-7 tracking-[-0.02em]'>
                        Already Reviewed
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReviewModal(order)}
                      className='flex flex-row justify-center items-center p-2 gap-2 w-full md:w-[240px] h-12 bg-[#C12116] rounded-full border-none cursor-pointer hover:bg-[#B01E14] transition-colors'
                    >
                      <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-7 tracking-[-0.02em]'>
                        Give Review
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmit={handleSubmitReview}
      />
    </>
  );
};

export default OrdersCard;

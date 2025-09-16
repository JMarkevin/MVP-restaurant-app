import React, { useState } from 'react';
import { Star, Edit3, Trash2 } from 'lucide-react';
import type { Review } from '@/types';
import EditReviewModal from '@/components/EditReviewModal';
import DeleteReviewModal from '@/components/DeleteReviewModal';

interface ReviewCardProps {
  review: Review;
  isCurrentUser?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  isDeleting?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isCurrentUser = false,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  // Get user name from review data
  const getUserName = () => {
    if (review.userName) return review.userName;
    if (review.user?.name) return review.user.name;
    return 'Anonymous';
  };

  // Get user profile picture from localStorage (same as navbar and profile page)
  const getUserAvatar = () => {
    // First check if this is the current user's review
    const currentUserId = 17; // This should come from auth context
    const isCurrentUserReview = review.user?.id === currentUserId;

    if (isCurrentUserReview) {
      // For current user, get profile picture from localStorage
      return typeof window !== 'undefined'
        ? localStorage.getItem('userProfilePicture') || ''
        : '';
    }

    // For other users, check review data
    if (review.user?.profilePicture) return review.user.profilePicture;
    if (review.user?.avatar) return review.user.avatar;
    if (review.user?.image) return review.user.image;
    return null;
  };

  // Get rating from review data (handle both star and rating fields)
  const getRating = () => {
    return review.star || review.rating || 5;
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(review.id);
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSaveEdit = (rating: number, comment: string) => {
    onEdit?.({
      ...review,
      star: rating,
      comment: comment,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div
      className='bg-white rounded-2xl shadow-lg p-4 relative transition-all duration-200 w-full md:w-[590px] h-auto md:h-[204px]'
      style={{
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered
          ? '0 10px 25px rgba(0, 0, 0, 0.15)'
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Review Header */}
      <div className='flex items-start gap-3 mb-4 h-16 md:h-16'>
        {/* User Avatar */}
        <div className='w-12 h-12 md:w-16 md:h-16 bg-gray-300 rounded-full overflow-hidden flex-shrink-0'>
          {getUserAvatar() ? (
            <img
              src={getUserAvatar() || undefined}
              alt={getUserName()}
              className='w-full h-full object-cover'
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : getUserName() ? (
            <div className='w-full h-full bg-gray-300 flex items-center justify-center'>
              <span
                style={{
                  fontFamily: 'Nunito',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#374151',
                }}
              >
                {getUserName().charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <div className='w-full h-full bg-gray-300' />
          )}
        </div>

        {/* User Info */}
        <div className='flex-1 min-w-0'>
          <h4
            className='text-base md:text-lg font-extrabold text-gray-900 leading-8 md:leading-8'
            style={{ height: '32px' }}
          >
            {getUserName()}
          </h4>
          <p
            className='text-sm md:text-base text-gray-900 leading-6 md:leading-8'
            style={{ height: '24px', lineHeight: '24px' }}
          >
            {formatDate(review.createdAt)}
          </p>
        </div>

        {/* Edit/Delete Buttons for Current User */}
        {isCurrentUser && (
          <div
            className={`flex gap-2 md:gap-3 ml-auto transition-all duration-200 ${
              isHovered
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-4'
            }`}
          >
            <button
              onClick={handleEdit}
              className='p-2 md:p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95'
              title='Edit review'
              style={{
                background: isHovered ? '#F9FAFB' : 'transparent',
                border: '1px solid #E5E7EB',
              }}
            >
              <Edit3 className='w-4 h-4 md:w-5 md:h-5 text-gray-600' />
            </button>
            <button
              onClick={handleDelete}
              className='p-2 md:p-3 rounded-xl hover:bg-red-100 transition-all duration-200 hover:scale-110 active:scale-95'
              title='Delete review'
              style={{
                background: isHovered ? '#FEF2F2' : 'transparent',
                border: '1px solid #FECACA',
              }}
            >
              <Trash2 className='w-4 h-4 md:w-5 md:h-5 text-red-600' />
            </button>
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className='h-auto md:h-[92px]'>
        {/* Stars */}
        <div className='flex gap-0.5 mb-2 h-6 md:h-6 w-24 md:w-32'>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 md:w-6 md:h-6 ${
                i < getRating()
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Review Text */}
        <p className='text-sm md:text-base text-gray-900 leading-relaxed h-auto md:h-[60px]'>
          {review.comment || 'Great food and service!'}
        </p>
      </div>

      {/* Edit Review Modal */}
      <EditReviewModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        review={review}
      />

      {/* Delete Review Modal */}
      <DeleteReviewModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ReviewCard;

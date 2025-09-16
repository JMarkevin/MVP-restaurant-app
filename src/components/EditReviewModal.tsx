import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Review } from '@/types';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rating: number, comment: string) => void;
  review: Review | null;
  isLoading?: boolean;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  review,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Initialize form with review data when modal opens
  useEffect(() => {
    if (isOpen && review) {
      setRating(review.star || review.rating || 0);
      setComment(review.comment || '');
    }
  }, [isOpen, review]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      onSave(rating, comment);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4'
      onClick={handleClose}
    >
      <div
        className='w-full max-w-[393px] md:max-w-[439px] h-auto md:h-[518px] bg-white rounded-2xl flex flex-col items-center p-4 md:p-6 gap-4 md:gap-6'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Frame 96 */}
        <div className='flex flex-row justify-between items-center px-0 w-full h-9 md:h-9'>
          {/* Edit Review Title */}
          <div className='font-nunito font-extrabold text-xl md:text-2xl leading-9 md:leading-9 text-[#0A0D12]'>
            Edit Review
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className='w-6 h-6 md:w-6 md:h-6 bg-none border-none cursor-pointer flex items-center justify-center'
          >
            <X size={24} style={{ color: '#0A0D12' }} />
          </button>
        </div>

        {/* Rating Section - Frame 97 */}
        <div className='flex flex-col justify-center items-center px-0 w-full h-20 md:h-20'>
          {/* Give Rating Text */}
          <div className='font-nunito font-extrabold text-base md:text-base leading-8 md:leading-8 text-center text-[#0A0D12] mb-2 w-full'>
            Give Rating
          </div>

          {/* Star Rating - Frame 25 */}
          <div className='flex flex-row justify-center items-center px-0 gap-1 w-full h-12 md:h-12'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className='w-10 h-10 md:w-12 md:h-12 bg-none border-none cursor-pointer p-0 flex items-center justify-center transition-transform duration-200 hover:scale-110'
              >
                <svg
                  width='40'
                  height='40'
                  viewBox='0 0 50 49'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='md:w-[50px] md:h-[49px]'
                >
                  <path
                    d='M25.3339 35.2677L16.861 40.3719C16.4867 40.6101 16.0954 40.7122 15.687 40.6781C15.2787 40.6441 14.9214 40.508 14.6152 40.2698C14.3089 40.0316 14.0707 39.7342 13.9006 39.3776C13.7305 39.021 13.6964 38.6208 13.7985 38.1771L16.0443 28.5302L8.54122 22.0479C8.20094 21.7417 7.9886 21.3925 7.90422 21.0005C7.81983 20.6085 7.84501 20.2261 7.97976 19.8531C8.11451 19.4802 8.31867 19.1739 8.59226 18.9344C8.86584 18.6948 9.24015 18.5417 9.71517 18.475L19.6173 17.6073L23.4454 8.52188C23.6155 8.11354 23.8796 7.80729 24.2375 7.60312C24.5955 7.39896 24.961 7.29687 25.3339 7.29688C25.7069 7.29688 26.0723 7.39896 26.4303 7.60312C26.7883 7.80729 27.0523 8.11354 27.2225 8.52188L31.0506 17.6073L40.9527 18.475C41.4291 18.5431 41.8034 18.6962 42.0756 18.9344C42.3478 19.1726 42.552 19.4788 42.6881 19.8531C42.8242 20.2274 42.8501 20.6106 42.7657 21.0026C42.6813 21.3946 42.4683 21.743 42.1266 22.0479L34.6235 28.5302L36.8693 38.1771C36.9714 38.6194 36.9374 39.0196 36.7673 39.3776C36.5971 39.7356 36.3589 40.033 36.0527 40.2698C35.7464 40.5066 35.3891 40.6427 34.9808 40.6781C34.5725 40.7135 34.1811 40.6114 33.8068 40.3719L25.3339 35.2677Z'
                    fill={star <= rating ? '#FDB022' : '#A4A7AE'}
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area - Inputfield */}
        <div className='box-border flex flex-row justify-center items-start p-2 md:p-3 gap-2 w-full h-48 md:h-[235px] border border-[#D5D7DA] rounded-xl'>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Please share your thoughts about our service!'
            className='w-full h-full font-nunito font-normal text-sm md:text-base leading-6 md:leading-8 tracking-[-0.02em] bg-none border-none outline-none resize-none flex-1'
            style={{
              color: comment ? '#0A0D12' : '#717680',
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isLoading}
          className={`flex flex-row justify-center items-center p-2 gap-2 w-full h-12 md:h-12 rounded-full border-none transition-colors duration-200 ${
            rating > 0 && !isLoading
              ? 'bg-[#C12116] cursor-pointer'
              : 'bg-[#A4A7AE] cursor-not-allowed'
          }`}
        >
          <div className='font-nunito font-bold text-sm md:text-base leading-8 md:leading-8 tracking-[-0.02em] text-[#FDFDFD]'>
            {isLoading ? 'Saving...' : 'Save'}
          </div>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default EditReviewModal;

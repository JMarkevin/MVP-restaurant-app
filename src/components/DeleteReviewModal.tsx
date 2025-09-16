import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2 } from 'lucide-react';

interface DeleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteReviewModal: React.FC<DeleteReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4'
      onClick={onClose}
    >
      <div
        className='w-full max-w-[393px] md:max-w-[439px] h-auto md:h-[300px] bg-white rounded-2xl flex flex-col items-center p-4 md:p-6 gap-4 md:gap-6'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Frame 96 */}
        <div className='flex flex-row justify-between items-center px-0 w-full h-9 md:h-9'>
          {/* Delete Review Title */}
          <div className='font-nunito font-extrabold text-xl md:text-2xl leading-9 md:leading-9 text-[#0A0D12]'>
            Delete Review
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className='w-6 h-6 md:w-6 md:h-6 bg-none border-none cursor-pointer flex items-center justify-center'
          >
            <X size={24} style={{ color: '#0A0D12' }} />
          </button>
        </div>

        {/* Warning Icon and Message */}
        <div className='flex flex-col justify-center items-center px-0 gap-4 w-full h-24 md:h-30'>
          {/* Warning Icon */}
          <div className='w-16 h-16 md:w-16 md:h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center'>
            <Trash2 size={32} style={{ color: '#DC2626' }} />
          </div>

          {/* Warning Message */}
          <div className='font-nunito font-semibold text-sm md:text-base leading-5 md:leading-5 text-center text-[#0A0D12] w-full'>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-row justify-center items-center px-0 gap-3 w-full h-12 md:h-12'>
          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex flex-row justify-center items-center px-6 py-2 gap-2 w-24 md:w-30 h-12 md:h-12 rounded-full border-none transition-colors duration-200 ${
              isLoading
                ? 'cursor-not-allowed'
                : 'cursor-pointer hover:bg-[#E5E7EB]'
            } bg-[#F3F4F6]`}
          >
            <div className='font-nunito font-bold text-sm md:text-base leading-8 md:leading-8 tracking-[-0.02em] text-[#374151]'>
              Cancel
            </div>
          </button>

          {/* Delete Button */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex flex-row justify-center items-center px-6 py-2 gap-2 w-24 md:w-30 h-12 md:h-12 rounded-full border-none transition-colors duration-200 ${
              isLoading
                ? 'bg-[#A4A7AE] cursor-not-allowed'
                : 'bg-[#DC2626] cursor-pointer hover:bg-[#B91C1C]'
            }`}
          >
            <div className='font-nunito font-bold text-sm md:text-base leading-8 md:leading-8 tracking-[-0.02em] text-[#FDFDFD]'>
              {isLoading ? 'Deleting...' : 'Delete'}
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteReviewModal;

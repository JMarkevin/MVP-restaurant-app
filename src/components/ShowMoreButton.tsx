import React from 'react';
import { Button } from '@/ui/button';

interface ShowMoreButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  showButton: boolean;
  expandedText?: string;
  collapsedText?: string;
  className?: string;
  disabled?: boolean;
}

const ShowMoreButton: React.FC<ShowMoreButtonProps> = ({
  isExpanded,
  onToggle,
  showButton,
  expandedText = 'Show Less',
  collapsedText = 'Show More',
  className = '',
  disabled = false,
}) => {
  if (!showButton) return null;

  return (
    <div className={`text-center ${className}`}>
      <Button
        variant='outline'
        size='lg'
        onClick={onToggle}
        disabled={disabled}
        className='border border-[#D5D7DA] rounded-full px-2 py-2 md:px-8 md:py-3 text-sm md:text-base font-bold text-[#0A0D12] hover:bg-gray-50 w-40 md:w-auto h-10 md:h-auto'
      >
        {disabled ? (
          <div className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900'></div>
            Loading...
          </div>
        ) : isExpanded ? (
          expandedText
        ) : (
          collapsedText
        )}
      </Button>
    </div>
  );
};

export default ShowMoreButton;

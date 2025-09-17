import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfileWithAddress } from '@/hooks/useUserProfileWithAddress';
import { generateInitials } from '@/utils/imageUpload';

interface MobileProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileProfileSidebar: React.FC<MobileProfileSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: userProfile } = useUserProfileWithAddress();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const handleNavigateToProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to profile page with explicit tab parameter to ensure profile card is shown
    navigate('/profile?tab=profile');
    onClose();
  };

  const handleNavigateToAddress = () => {
    navigate('/profile?tab=address');
    onClose();
  };

  const handleNavigateToOrders = () => {
    navigate('/profile?tab=orders');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
        onClick={onClose}
      />

      {/* Popup Card */}
      <div
        className='fixed top-16 right-4 z-50 md:hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Profile Card */}
        <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 w-[197px] h-[200px] flex flex-col justify-center items-start gap-3'>
          {/* User Info - Frame 36 */}
          <div
            className='flex items-center gap-2 w-[165px] h-9 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors select-none'
            onClick={handleNavigateToProfile}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            style={{ minHeight: '36px' }}
          >
            {/* Profile Picture - Ellipse 3 */}
            <div className='w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-none'>
              {userProfile?.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt='Profile'
                  className='w-full h-full object-cover rounded-full'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <span className='text-sm font-semibold text-gray-600'>
                  {generateInitials(userProfile?.name || 'User')}
                </span>
              )}
            </div>
            {/* User Name - John Doe */}
            <span className='text-base font-bold text-[#0A0D12] font-nunito leading-[30px] tracking-[-0.02em] flex-none'>
              {userProfile?.name || 'User'}
            </span>
          </div>

          {/* Separator - Line 16 */}
          <div className='w-[165px] h-px border border-[#E9EAEB] flex-none'></div>

          {/* Navigation Links */}
          <div className='flex flex-col gap-3 flex-none'>
            {/* Delivery Address - Frame 45 */}
            <div
              className='flex items-center gap-2 w-[138px] h-7 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
              onClick={handleNavigateToAddress}
            >
              <div className='w-5 h-5 flex items-center justify-center flex-none'>
                <MapPin className='w-5 h-5 text-[#0A0D12]' />
              </div>
              <span className='text-sm font-medium text-[#0A0D12] font-nunito leading-7 flex-none'>
                Delivery Address
              </span>
            </div>

            {/* My Orders - Frame 43 */}
            <div
              className='flex items-center gap-2 w-[95px] h-7 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
              onClick={handleNavigateToOrders}
            >
              <div className='w-5 h-5 flex items-center justify-center flex-none'>
                <FileText className='w-5 h-5 text-[#181D27]' />
              </div>
              <span className='text-sm font-medium text-[#181D27] font-nunito leading-7 flex-none'>
                My Orders
              </span>
            </div>

            {/* Logout - Frame 46 */}
            <div
              className='flex items-center gap-2 w-[73px] h-7 cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors'
              onClick={handleLogout}
            >
              <div className='w-5 h-5 flex items-center justify-center flex-none'>
                <LogOut className='w-5 h-5 text-[#0A0D12]' />
              </div>
              <span className='text-sm font-medium text-[#0A0D12] font-nunito leading-7 flex-none'>
                Logout
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileProfileSidebar;

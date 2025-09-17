import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfileWithAddress } from '@/hooks/useUserProfileWithAddress';
import Footer from '@/components/Footer';
import OrdersCard from '@/components/OrdersCard';
import ProfileCard from '@/components/ProfileCard';
import AddressCard from '@/components/AddressCard';
import { generateInitials } from '@/utils/imageUpload';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeCard, setActiveCard] = useState<
    'profile' | 'address' | 'orders'
  >('profile');
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);

  // Handle URL parameter to show address or orders card
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'address') {
      setActiveCard('address');
    } else if (tab === 'orders') {
      setActiveCard('orders');
    } else if (tab === 'profile') {
      setActiveCard('profile');
    }
  }, [location.search]);

  // Get user data from AuthContext and combine with localStorage data
  const { user } = useAuth();
  const { data: userProfile } = useUserProfileWithAddress();

  // Use AuthContext user data as primary source, fallback to userProfile hook
  const displayUser = user || userProfile;

  const handleLogout = () => {
    setIsLogoutClicked(true);
    // Use the proper logout function from AuthContext
    logout();
    // Navigate to home page
    navigate('/');
  };

  const handleEditAddress = () => {
    setActiveCard('address');
  };

  const handleShowProfile = () => {
    setActiveCard('profile');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Main Content */}
      <div
        className='mx-auto py-8 px-4 md:px-10'
        style={{
          paddingTop: '100px',
          maxWidth: '1400px',
        }}
      >
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Left Sidebar - Sidebar Profile - Hidden on Mobile */}
          <div
            className='hidden md:flex bg-white rounded-2xl shadow-lg'
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: '20px 20px 20px 28px',
              gap: '24px',
              width: '240px',
              height: '274px',
              background: '#FFFFFF',
              boxShadow: '0px 0px 20px rgba(203, 202, 202, 0.25)',
              borderRadius: '16px',
            }}
          >
            {/* User Info - Frame 36 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '0px',
                gap: '8px',
                width: '200px',
                height: '48px',
              }}
              className='cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
              onClick={handleShowProfile}
            >
              {/* Profile Picture - Ellipse 3 */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: displayUser?.profilePicture
                    ? `url(${displayUser.profilePicture})`
                    : '#E5E7EB',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {displayUser?.profilePicture ? (
                  <img
                    src={displayUser.profilePicture}
                    alt='Profile'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    {generateInitials(displayUser?.name || 'User')}
                  </span>
                )}
              </div>
              {/* User Name */}
              <span
                style={{
                  flex: 1,
                  minHeight: '32px',
                  fontFamily: 'Nunito',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '20px',
                  letterSpacing: '-0.03em',
                  color: activeCard === 'profile' ? '#C12116' : '#0A0D12',
                  display: 'flex',
                  alignItems: 'center',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayUser?.name || 'User'}
              </span>
            </div>

            {/* Separator - Line 16 */}
            <div
              style={{
                width: '192px',
                height: '0px',
                border: '1px solid #E9EAEB',
              }}
            ></div>

            {/* Navigation Links */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* Delivery Address - Frame 45 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '0px',
                  gap: '8px',
                  width: '150px',
                  height: '30px',
                }}
                className='cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
                onClick={handleEditAddress}
              >
                {/* MapPin Icon */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin
                    style={{
                      width: '24px',
                      height: '24px',
                      color: activeCard === 'address' ? '#C12116' : '#0A0D12',
                    }}
                  />
                </div>
                {/* Delivery Address Text */}
                <span
                  style={{
                    width: '118px',
                    height: '30px',
                    fontFamily: 'Nunito',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '30px',
                    letterSpacing: '-0.03em',
                    color: activeCard === 'address' ? '#C12116' : '#0A0D12',
                  }}
                >
                  Delivery Address
                </span>
              </div>

              {/* My Orders - Frame 43 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '0px',
                  gap: '8px',
                  width: '104px',
                  height: '30px',
                }}
                className='cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
                onClick={() => setActiveCard('orders')}
              >
                {/* FileText Icon */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText
                    style={{
                      width: '24px',
                      height: '24px',
                      color: activeCard === 'orders' ? '#C12116' : '#0A0D12',
                    }}
                  />
                </div>
                {/* My Orders Text */}
                <span
                  style={{
                    width: '72px',
                    height: '30px',
                    fontFamily: 'Nunito',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '30px',
                    letterSpacing: '-0.03em',
                    color: activeCard === 'orders' ? '#C12116' : '#0A0D12',
                  }}
                >
                  My Orders
                </span>
              </div>

              {/* Logout - Frame 46 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '0px',
                  gap: '8px',
                  width: '81px',
                  height: '30px',
                }}
                className='cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors'
                onClick={handleLogout}
              >
                {/* LogOut Icon */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LogOut
                    style={{
                      width: '24px',
                      height: '24px',
                      color: isLogoutClicked ? '#C12116' : '#0A0D12',
                    }}
                  />
                </div>
                {/* Logout Text */}
                <span
                  style={{
                    width: '49px',
                    height: '30px',
                    fontFamily: 'Nunito',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '30px',
                    letterSpacing: '-0.03em',
                    color: isLogoutClicked ? '#C12116' : '#0A0D12',
                  }}
                >
                  Logout
                </span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className='w-full md:flex-1'>
            {/* Profile Card */}
            {activeCard === 'profile' && <ProfileCard />}

            {/* Address Card */}
            {activeCard === 'address' && <AddressCard />}

            {/* Orders Card */}
            {activeCard === 'orders' && <OrdersCard />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProfilePage;

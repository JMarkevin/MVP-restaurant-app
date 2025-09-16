import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';
import { authApi } from '@/services/api/auth';
import { useUserProfileWithAddress } from '@/hooks/useUserProfileWithAddress';
import {
  validateImageFile,
  fileToBase64,
  generateInitials,
  createPreviewUrl,
  revokePreviewUrl,
} from '@/utils/imageUpload';

interface ProfileCardProps {
  // No props needed as it manages its own state
  [key: string]: unknown;
}

const ProfileCard: React.FC<ProfileCardProps> = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
  });

  // Initialize profile picture data directly from localStorage
  const [profilePictureData, setProfilePictureData] = useState({
    profilePicture:
      typeof window !== 'undefined'
        ? localStorage.getItem('userProfilePicture') || ''
        : '',
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  // Use ref to track if we've initialized form data
  const formDataInitialized = useRef(false);

  // Fetch user profile data with address from localStorage
  const { data: userProfile, isLoading: isProfileLoading } =
    useUserProfileWithAddress();

  // Update profile mutation (without profilePicture since backend doesn't support it)
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string }) =>
      authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });

  // Update profile picture mutation (using localStorage since backend doesn't support image storage)
  const updateProfilePictureMutation = useMutation({
    mutationFn: (data: { profilePicture: string }) => {
      // Store profile picture in localStorage
      localStorage.setItem('userProfilePicture', data.profilePicture);
      return Promise.resolve({ data: { profilePicture: data.profilePicture } });
    },
    onSuccess: () => {
      // Invalidate the userProfile query to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Failed to update profile picture:', error);
    },
  });

  // Initialize form data when profile loads (only once)
  if (userProfile && !formDataInitialized.current) {
    setFormData({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      profilePicture:
        profilePictureData.profilePicture || userProfile.profilePicture || '',
    });
    setProfileImagePreview(
      profilePictureData.profilePicture || userProfile.profilePicture || null
    );
    formDataInitialized.current = true;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        profilePicture: userProfile.profilePicture || '',
      });
    }
  };

  const handleSave = () => {
    // Update profile data (name, email, phone) via API
    updateProfileMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    // Update profile picture via localStorage
    if (formData.profilePicture) {
      updateProfilePictureMutation.mutate({
        profilePicture: formData.profilePicture,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Create preview URL
      const previewUrl = createPreviewUrl(file);
      setProfileImagePreview(previewUrl);

      try {
        // Convert to base64 for storage
        const base64 = await fileToBase64(file);
        setFormData((prev) => ({
          ...prev,
          profilePicture: base64,
        }));
        // Also update profilePictureData state
        setProfilePictureData({ profilePicture: base64 });
      } catch (error) {
        console.error('Failed to process image:', error);
        alert('Failed to process image. Please try again.');
        // Clean up preview URL
        revokePreviewUrl(previewUrl);
        setProfileImagePreview(null);
      }
    }
  };

  // Clean up preview URLs when component unmounts or image changes
  React.useEffect(() => {
    return () => {
      if (profileImagePreview) {
        revokePreviewUrl(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  return (
    <>
      {/* Profile Title */}
      <h1
        className='text-2xl md:text-3xl font-extrabold text-[#0A0D12] mb-4 md:mb-6 leading-9 md:leading-tight'
        style={{ fontFamily: 'Nunito' }}
      >
        Profile
      </h1>

      {/* Profile Details Card - Frame 71 */}
      <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 md:p-5 w-[361px] md:w-[524px] h-[272px] md:h-[298px] flex flex-col items-start gap-6 md:gap-6'>
        {/* Frame 70 - User Info Container */}
        <div className='flex flex-col items-start gap-2 w-[329px] md:w-[484px] h-[172px] md:h-[190px] flex-none'>
          {/* User Avatar - Ellipse 3 */}
          <div className='w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center flex-none relative overflow-hidden'>
            {profileImagePreview || userProfile?.profilePicture ? (
              <img
                src={profileImagePreview || userProfile?.profilePicture}
                alt='Profile'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: 'Nunito',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  fontSize: '24px',
                  color: '#6b7280',
                }}
              >
                {generateInitials(userProfile?.name || 'User')}
              </span>
            )}

            {/* Image Upload Overlay (only in edit mode) */}
            {isEditing && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0';
                }}
              >
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  📷
                </span>
              </div>
            )}
          </div>

          {/* Name Row - Frame 53 */}
          <div className='flex flex-row justify-between items-center w-[329px] md:w-[484px] h-7 flex-none'>
            {/* Name Label */}
            <span className='text-sm font-medium text-[#0A0D12] font-nunito leading-7 flex-none'>
              Name
            </span>
            {/* Name Value/Input */}
            {isEditing ? (
              <input
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className='h-7 font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1 text-right border border-gray-300 rounded px-2 bg-white'
                placeholder='Enter your name'
              />
            ) : (
              <span className='h-7 font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1 text-right'>
                {isProfileLoading
                  ? 'Loading...'
                  : userProfile?.name || 'Johndoe'}
              </span>
            )}
          </div>

          {/* Email Row - Frame 54 */}
          <div className='flex flex-row justify-between items-center w-[329px] md:w-[484px] h-7 flex-none'>
            {/* Email Label */}
            <span className='text-sm font-medium text-[#0A0D12] font-nunito leading-7 flex-none'>
              Email
            </span>
            {/* Email Value/Input */}
            {isEditing ? (
              <input
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className='h-7 font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1 text-right border border-gray-300 rounded px-2 bg-white'
                placeholder='Enter your email'
              />
            ) : (
              <span className='h-7 font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1 text-right'>
                {isProfileLoading
                  ? 'Loading...'
                  : userProfile?.email || 'johndoe@email.com'}
              </span>
            )}
          </div>

          {/* Phone Row - Frame 55 */}
          <div className='flex flex-row justify-between items-center w-[329px] md:w-[484px] h-7 flex-none'>
            {/* Phone Label */}
            <span className='text-sm font-medium text-[#0A0D12] font-nunito leading-7 flex-none'>
              Nomor Handphone
            </span>
            {/* Phone Value/Input */}
            {isEditing ? (
              <input
                type='tel'
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className='h-7 font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1 text-right border border-gray-300 rounded px-2 bg-white'
                placeholder='Enter your phone number'
              />
            ) : (
              <span className='h-7 font-nunito font-bold text-sm leading-7 tracking-[-0.02em] text-[#0A0D12] flex-1 text-right'>
                {isProfileLoading
                  ? 'Loading...'
                  : userProfile?.phone || '081234567890'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className='flex flex-row justify-center items-center gap-3 w-[329px] md:w-[484px] h-11 flex-none'>
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className={`flex flex-row justify-center items-center px-4 py-2 gap-2 h-11 bg-[#C12116] rounded-full border-none flex-1 transition-colors ${
                updateProfileMutation.isPending
                  ? 'opacity-70 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-[#B01E14]'
              }`}
            >
              <Save className='w-4 h-4 text-white' />
              <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-[30px] tracking-[-0.02em]'>
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </span>
            </button>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
              className={`flex flex-row justify-center items-center px-4 py-2 gap-2 h-11 bg-gray-500 rounded-full border-none flex-1 transition-colors ${
                updateProfileMutation.isPending
                  ? 'opacity-70 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-gray-600'
              }`}
            >
              <X className='w-4 h-4 text-white' />
              <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-[30px] tracking-[-0.02em]'>
                Cancel
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className='flex flex-row justify-center items-center p-2 gap-2 w-[329px] md:w-[484px] h-11 bg-[#C12116] rounded-full border-none cursor-pointer flex-none hover:bg-[#B01E14] transition-colors'
          >
            {/* Button Label */}
            <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-[30px] tracking-[-0.02em] flex-none'>
              Update Profile
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default ProfileCard;

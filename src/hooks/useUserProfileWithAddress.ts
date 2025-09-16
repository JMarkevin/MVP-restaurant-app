import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth';

export const useUserProfileWithAddress = () => {
  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
    select: (response) => response.data,
    enabled: false, // Disable automatic fetching to prevent loops
    retry: false, // Don't retry on failure
  });

  // Get address and profile picture from localStorage
  const address =
    typeof window !== 'undefined'
      ? localStorage.getItem('userAddress') || ''
      : '';

  const profilePicture =
    typeof window !== 'undefined'
      ? localStorage.getItem('userProfilePicture') || ''
      : '';

  // Combine user profile with address and profile picture from localStorage
  const userProfileWithAddress = userProfile
    ? {
        ...userProfile,
        address: address,
        profilePicture: profilePicture || userProfile.profilePicture, // Use localStorage first, fallback to API
      }
    : null;

  return {
    data: userProfileWithAddress,
    isLoading,
    error,
  };
};

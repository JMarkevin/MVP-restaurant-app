import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth';

export const useUserProfileWithAddress = () => {
  // Check if user is authenticated by checking for token
  const isAuthenticated =
    typeof window !== 'undefined' &&
    (localStorage.getItem('token') || sessionStorage.getItem('token'));

  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
    select: (response) => response.data,
    enabled: !!isAuthenticated, // Enable when user is authenticated
    retry: false, // Don't retry on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
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

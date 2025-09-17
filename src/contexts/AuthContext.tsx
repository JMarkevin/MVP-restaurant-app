import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  useLoginMutation,
  useRegisterMutation,
  useProfileQuery,
} from '@/services/queries/auth';
import { useQueryClient } from '@tanstack/react-query';
import type { User, LoginRequest, RegisterRequest } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useProfileQuery();

  // Check for existing token on mount
  useEffect(() => {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Manually trigger profile fetch when token exists
      refetchProfile();
    }
  }, [refetchProfile]);

  useEffect(() => {
    if (profileData) {
      setUser(profileData.data);
      setIsAuthenticated(true);
    } else if (isProfileError) {
      // If profile fetch fails, it means token might be invalid or expired
      // Clear token and user state without calling logout to prevent loops
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [profileData, isProfileError]);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    const credentials: LoginRequest = { email, password };
    const response = await loginMutation.mutateAsync(credentials);

    // Store token based on rememberMe preference
    if (rememberMe) {
      localStorage.setItem('token', response.data.token);
    } else {
      // Use sessionStorage for non-remembered logins (cleared when browser closes)
      sessionStorage.setItem('token', response.data.token);
    }

    setUser(response.data.user);
    setIsAuthenticated(true);

    // Add a small delay before invalidating queries to ensure token is properly set
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] }); // Invalidate cart on login
      queryClient.invalidateQueries({ queryKey: ['orders'] }); // Invalidate orders on login
    }, 100);
  };

  const register = async (userData: RegisterRequest) => {
    const response = await registerMutation.mutateAsync(userData);
    // Registration always uses localStorage (remembered by default)
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);

    // Add a small delay before invalidating queries to ensure token is properly set
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] }); // Invalidate cart on register
      queryClient.invalidateQueries({ queryKey: ['orders'] }); // Invalidate orders on register
    }, 100);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear(); // Clear all React Query cache on logout
  };

  const isLoading =
    loginMutation.isPending || registerMutation.isPending || isLoadingProfile;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

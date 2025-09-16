import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import leftImageModal from '/leftimage-modal.png';
import restaurantPlaceholder from '/restaurant-placeholder.jpg';
import redLogo from '/red-logo.png';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onModeChange,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setError('');
    setFieldErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    });
  }, [initialMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    // Clear field-specific error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (mode === 'register') {
      // Name validation
      if (!formData.name) {
        errors.name = 'Name is required';
      }

      // Phone validation
      if (!formData.phone) {
        errors.phone = 'Phone number is required';
      } else if (
        !/^(\+62|62|0)[0-9]{8,13}$/.test(formData.phone.replace(/\s/g, ''))
      ) {
        errors.phone =
          'Please provide a valid Indonesian phone number (e.g., +6281234567890 or 081234567890)';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password, rememberMe);
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'An error occurred'
          : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    onModeChange?.(newMode); // Notify parent component of mode change
    setError('');
    setFieldErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999] p-4 pt-12 md:pt-4'
      onClick={(e) => {
        // Only close when clicking on the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className='relative w-full max-w-[393px] md:max-w-6xl h-[800px] md:h-[1024px] bg-white rounded-2xl overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-6 right-6 z-20 w-10 h-10 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all backdrop-blur-sm'
        >
          <X className='w-6 h-6 text-white' />
        </button>

        {/* Left Side - Food Image - Hidden on mobile */}
        <div className='hidden md:block absolute left-0 top-0 w-1/2 h-full'>
          <img
            src={leftImageModal}
            alt='Food'
            className='w-full h-full object-cover'
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = restaurantPlaceholder;
            }}
          />
        </div>

        {/* Right Side - Form - Full width on mobile, half width on desktop */}
        <div
          className={`w-full md:absolute md:right-0 md:top-0 md:w-1/2 h-full flex justify-center ${
            mode === 'login' ? 'items-center' : 'items-center pt-12 md:pt-30'
          }`}
        >
          <div
            className={`w-[345px] md:w-[300px] flex flex-col gap-3 md:gap-3 transition-all duration-300 ${
              mode === 'register'
                ? 'h-[680px] md:h-[520px]'
                : 'h-[580px] md:h-[380px]'
            } ${error ? 'justify-start' : 'justify-center'}`}
          >
            {/* Logo */}
            <div className='flex items-center gap-[11.43px]'>
              <img
                src={redLogo}
                alt='Foody Logo'
                className='w-8 h-8 md:w-10 md:h-10'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className='text-[24.381px] md:text-2xl font-extrabold text-[#0A0D12] leading-8 md:leading-none'>
                Foody
              </span>
            </div>

            {/* Welcome Text */}
            <div className='flex flex-col gap-0'>
              <h1 className='text-2xl md:text-2xl font-extrabold text-[#0A0D12] leading-9 md:leading-none'>
                Welcome Back
              </h1>
              <p className='text-sm md:text-sm font-medium text-[#0A0D12] leading-7 md:leading-none'>
                Good to see you again! Let's eat
              </p>
            </div>

            {/* Mode Toggle */}
            <div className='flex items-center p-2 bg-[#F5F5F5] rounded-2xl'>
              <button
                type='button'
                onClick={() => {
                  setMode('login');
                  onModeChange?.('login');
                }}
                className={`flex-1 h-9 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all ${
                  mode === 'login'
                    ? 'bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] text-[#0A0D12] font-bold'
                    : 'text-[#535862] font-medium'
                }`}
              >
                <span className='text-sm md:text-sm leading-7 md:leading-none'>
                  Sign in
                </span>
              </button>
              <button
                type='button'
                onClick={() => {
                  setMode('register');
                  onModeChange?.('register');
                }}
                className={`flex-1 h-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all ${
                  mode === 'register'
                    ? 'bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] text-[#0A0D12] font-bold'
                    : 'text-[#535862] font-medium'
                }`}
              >
                <span className='text-sm md:text-sm leading-7 md:leading-none'>
                  Sign up
                </span>
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className='flex flex-col gap-3 md:gap-2'
            >
              {/* Name Field - Only for Register */}
              {mode === 'register' && (
                <div className='flex flex-col gap-1'>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='Name'
                    className={`w-full h-12 md:h-10 px-3 py-2 border border-[#D5D7DA] rounded-xl md:rounded-xl text-sm md:text-sm placeholder-[#717680] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      fieldErrors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#D5D7DA] focus:ring-red-500'
                    }`}
                  />
                  {fieldErrors.name && (
                    <div className='text-sm font-semibold text-red-600 leading-7'>
                      {fieldErrors.name}
                    </div>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className='flex flex-col gap-1'>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Email'
                  className={`w-full h-12 md:h-10 px-3 py-2 border border-[#D5D7DA] rounded-xl md:rounded-xl text-sm md:text-sm placeholder-[#717680] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    fieldErrors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#D5D7DA] focus:ring-red-500'
                  }`}
                />
                {fieldErrors.email && (
                  <div className='text-sm font-semibold text-red-600 leading-7'>
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              {/* Phone Field - Only for Register */}
              {mode === 'register' && (
                <div className='flex flex-col gap-1'>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder='Phone (e.g., +6281234567890)'
                    className={`w-full h-12 md:h-10 px-3 py-2 border border-[#D5D7DA] rounded-xl md:rounded-xl text-sm md:text-sm placeholder-[#717680] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      fieldErrors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#D5D7DA] focus:ring-red-500'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <div className='text-sm font-semibold text-red-600 leading-7'>
                      {fieldErrors.phone}
                    </div>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div className='flex flex-col gap-1'>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder='Password'
                    className={`w-full h-12 md:h-10 px-3 py-2 pr-12 border border-[#D5D7DA] rounded-xl md:rounded-xl text-sm md:text-sm placeholder-[#717680] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      fieldErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#D5D7DA] focus:ring-red-500'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                  >
                    {showPassword ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className='text-sm font-semibold text-red-600 leading-7'>
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field - Only for Register */}
              {mode === 'register' && (
                <div className='flex flex-col gap-1'>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder='Confirm Password'
                      className={`w-full h-12 md:h-10 px-3 py-2 pr-12 border border-[#D5D7DA] rounded-xl md:rounded-xl text-sm md:text-sm placeholder-[#717680] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        fieldErrors.confirmPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-[#D5D7DA] focus:ring-red-500'
                      }`}
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='w-4 h-4' />
                      ) : (
                        <Eye className='w-4 h-4' />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <div className='text-sm font-semibold text-red-600 leading-7'>
                      {fieldErrors.confirmPassword}
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me - Only for Login */}
              {mode === 'login' && (
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='rememberMe'
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className='w-5 h-5 border border-[#D5D7DA] rounded-md text-red-600 focus:ring-red-500 focus:ring-2 accent-red-600'
                    style={{
                      accentColor: '#C12116',
                    }}
                  />
                  <label
                    htmlFor='rememberMe'
                    className='text-sm md:text-sm font-medium text-[#0A0D12] leading-7 md:leading-none'
                  >
                    Remember Me
                  </label>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className='text-red-500 text-sm bg-red-50 p-3 rounded-lg'>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full h-12 md:h-9 bg-[#C12116] text-[#FDFDFD] font-bold text-sm md:text-sm rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isLoading ? (
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                  </div>
                ) : mode === 'login' ? (
                  'Login'
                ) : (
                  'Register'
                )}
              </button>
            </form>

            {/* Switch Mode Link */}
            <div className='text-center'>
              <button
                type='button'
                onClick={switchMode}
                className='text-sm md:text-sm text-[#535862] hover:text-[#0A0D12] transition-colors'
              >
                {mode === 'login'
                  ? "Don't have an account? Register"
                  : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

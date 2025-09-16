import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Save, X } from 'lucide-react';

interface AddressCardProps {
  className?: string;
}

const AddressCard: React.FC<AddressCardProps> = () => {
  const queryClient = useQueryClient();
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Initialize address data directly from localStorage
  const [addressData, setAddressData] = useState({
    address:
      typeof window !== 'undefined'
        ? localStorage.getItem('userAddress') || ''
        : '',
  });

  // Update address mutation (using localStorage since backend doesn't support address storage)
  const updateAddressMutation = useMutation({
    mutationFn: (data: { address: string }) => {
      // Store address in localStorage
      localStorage.setItem('userAddress', data.address);
      return Promise.resolve({ data: { address: data.address } });
    },
    onSuccess: () => {
      // Invalidate the userProfile query to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Failed to update address:', error);
    },
  });

  const handleAddressChange = (value: string) => {
    setAddressData({ address: value });
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
    // Load current address from localStorage
    const currentAddress = localStorage.getItem('userAddress') || '';
    setAddressData({ address: currentAddress });
  };

  const handleCancelAddress = () => {
    setIsEditingAddress(false);
    // Reset to original address
    const originalAddress = localStorage.getItem('userAddress') || '';
    setAddressData({ address: originalAddress });
  };

  const handleSaveAddress = () => {
    updateAddressMutation.mutate(addressData);
    setIsEditingAddress(false);
  };

  return (
    <>
      {/* Address Title */}
      <h1
        className='text-2xl md:text-3xl font-extrabold text-[#0A0D12] mb-4 md:mb-6 leading-9 md:leading-tight'
        style={{ fontFamily: 'Nunito' }}
      >
        Delivery Address
      </h1>

      {/* Address Details Card */}
      <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 md:p-5 w-[361px] md:w-[524px] h-[272px] md:h-[298px] flex flex-col items-start gap-6 md:gap-6'>
        {/* Address Content Container */}
        <div className='flex flex-col items-start gap-3 w-[329px] md:w-[484px] h-[172px] md:h-[190px] flex-none'>
          {/* Address Header */}
          <div className='flex items-center gap-3 mb-3'>
            <MapPin className='w-5 h-5 md:w-6 md:h-6 text-[#0A0D12]' />
            <h3 className='text-lg md:text-xl font-extrabold text-[#0A0D12] font-nunito leading-7 md:leading-7'>
              Delivery Address
            </h3>
          </div>

          {/* Address Display/Input */}
          <div className='flex flex-col items-start gap-2 w-[329px] md:w-[484px] flex-none'>
            {/* Address Label */}
            <span className='text-sm font-medium text-[#0A0D12] font-nunito leading-7 flex-none'>
              Current Address:
            </span>

            {/* Address Value/Input */}
            {isEditingAddress ? (
              <textarea
                value={addressData.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder='Enter your delivery address'
                className='w-full min-h-[80px] p-3 border border-gray-300 rounded-lg font-nunito text-sm leading-5 text-gray-700 resize-vertical outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 flex-1'
              />
            ) : (
              <div className='w-full min-h-[80px] p-3 border border-gray-200 rounded-lg font-nunito text-sm leading-5 text-gray-700 bg-gray-50 flex items-start flex-1'>
                {addressData.address || 'No address provided'}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditingAddress ? (
          <div className='flex flex-row justify-center items-center gap-3 w-[329px] md:w-[484px] h-11 flex-none'>
            {/* Save Address Button */}
            <button
              onClick={handleSaveAddress}
              disabled={
                updateAddressMutation.isPending || !addressData.address.trim()
              }
              className={`flex flex-row justify-center items-center px-4 py-2 gap-2 h-11 rounded-full border-none flex-1 transition-colors ${
                updateAddressMutation.isPending || !addressData.address.trim()
                  ? 'bg-gray-400 opacity-70 cursor-not-allowed'
                  : 'bg-[#C12116] cursor-pointer hover:bg-[#B01E14]'
              }`}
            >
              <Save className='w-4 h-4 text-white' />
              <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-[30px] tracking-[-0.02em]'>
                {updateAddressMutation.isPending ? 'Saving...' : 'Save'}
              </span>
            </button>

            {/* Cancel Address Button */}
            <button
              onClick={handleCancelAddress}
              disabled={updateAddressMutation.isPending}
              className={`flex flex-row justify-center items-center px-4 py-2 gap-2 h-11 rounded-full border-none flex-1 transition-colors ${
                updateAddressMutation.isPending
                  ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                  : 'bg-gray-500 cursor-pointer hover:bg-gray-600'
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
            onClick={handleEditAddress}
            className='flex flex-row justify-center items-center p-2 gap-2 w-[329px] md:w-[484px] h-11 bg-[#C12116] rounded-full border-none cursor-pointer flex-none hover:bg-[#B01E14] transition-colors'
          >
            {/* Button Label */}
            <span className='text-base font-bold text-[#FDFDFD] font-nunito leading-[30px] tracking-[-0.02em] flex-none'>
              Update Address
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default AddressCard;

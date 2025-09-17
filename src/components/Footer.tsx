import React from 'react';
import { useNavigate } from 'react-router-dom';
import redLogo from '/red-logo.png';
import facebookIcon from '/facebook-icon.svg';
import instagramIcon from '/instagram-icon.svg';
import linkedinIcon from '/linkedin-icon.svg';
import tiktokIcon from '/tiktok-icon.svg';

interface FooterProps {
  // Props kept for backward compatibility but not used
  onCategoryClick?: (category: string) => void;
  onScrollToCategories?: () => void;
}

const Footer: React.FC<FooterProps> = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (filter: string | null) => {
    if (filter === null || filter === 'all') {
      // "All Food" goes to /category/all
      navigate('/category/all');
    } else {
      // Other categories go to /category/all with filter parameter
      navigate(`/category/all?filter=${filter}`);
    }
  };

  const handleHelpClick = (helpItem: string) => {
    switch (helpItem) {
      case 'How to Order':
        navigate('/category/all');
        break;
      case 'Payment Methods':
        navigate('/checkout');
        break;
      case 'Track My Order':
        navigate('/profile?tab=orders');
        break;
      case 'FAQ':
      case 'Contact Us':
        // Leave as is - no navigation
        break;
      default:
        break;
    }
  };
  return (
    <footer className='bg-[#0A0D12] text-white py-10 md:py-20 px-4 md:px-30'>
      <div className='max-w-[393px] md:max-w-6xl mx-auto'>
        <div className='flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-16'>
          {/* Company Info */}
          <div className='space-y-6 md:space-y-10'>
            <div className='flex items-center gap-4'>
              <img
                src={redLogo}
                alt='Foody Logo'
                className='w-10 h-10 md:w-10 md:h-10'
              />
              <span className='text-2xl md:text-display-md text-white font-nunito font-extrabold leading-[42px]'>
                Foody
              </span>
            </div>

            <p className='text-sm md:text-md-regular text-[#FDFDFD] leading-7 md:leading-relaxed font-nunito font-normal tracking-[-0.02em] max-w-[361px]'>
              Enjoy homemade flavors & chef's signature dishes, freshly prepared
              every day. Order online or visit our nearest branch.
            </p>

            <div className='space-y-4'>
              <h4 className='text-sm md:text-md-extrabold text-[#FDFDFD] font-nunito font-bold leading-7'>
                Follow on Social Media
              </h4>
              <div className='flex gap-3'>
                {/* Facebook */}
                <a
                  href='https://facebook.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 border border-[#252B37] rounded-full flex items-center justify-center hover:bg-gray-800 cursor-pointer transition-colors'
                >
                  <img
                    src={facebookIcon}
                    alt='Facebook'
                    className='w-5 h-5'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </a>

                {/* Instagram */}
                <a
                  href='https://instagram.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 border border-[#252B37] rounded-full flex items-center justify-center hover:bg-gray-800 cursor-pointer transition-colors'
                >
                  <img
                    src={instagramIcon}
                    alt='Instagram'
                    className='w-5 h-5'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </a>

                {/* LinkedIn */}
                <a
                  href='https://linkedin.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 border border-[#252B37] rounded-full flex items-center justify-center hover:bg-gray-800 cursor-pointer transition-colors'
                >
                  <img
                    src={linkedinIcon}
                    alt='LinkedIn'
                    className='w-5 h-5'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </a>

                {/* TikTok */}
                <a
                  href='https://tiktok.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 border border-[#252B37] rounded-full flex items-center justify-center hover:bg-gray-800 cursor-pointer transition-colors'
                >
                  <img
                    src={tiktokIcon}
                    alt='TikTok'
                    className='w-5 h-5'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Menu Sections Container */}
          <div className='flex flex-row gap-6 md:contents'>
            {/* Explore Menu */}
            <div className='space-y-4 md:space-y-5 flex-1'>
              <h4 className='text-sm md:text-md-extrabold text-[#FDFDFD] font-nunito font-extrabold leading-7'>
                Explore
              </h4>
              <div className='space-y-3'>
                {[
                  { name: 'All Food', filter: null },
                  { name: 'Nearby', filter: 'nearby' },
                  { name: 'Discount', filter: 'discount' },
                  { name: 'Best Seller', filter: 'bestseller' },
                  { name: 'Delivery', filter: 'delivery' },
                  { name: 'Lunch', filter: 'lunch' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleCategoryClick(item.filter)}
                    className='block text-sm md:text-md-regular text-[#FDFDFD] hover:text-white text-left transition-colors font-nunito font-normal leading-7 tracking-[-0.02em]'
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Help Menu */}
            <div className='space-y-4 md:space-y-5 flex-1'>
              <h4 className='text-sm md:text-md-extrabold text-[#FDFDFD] font-nunito font-extrabold leading-7'>
                Help
              </h4>
              <div className='space-y-3'>
                {[
                  'How to Order',
                  'Payment Methods',
                  'Track My Order',
                  'FAQ',
                  'Contact Us',
                ].map((item) => {
                  const isNavigable = [
                    'How to Order',
                    'Payment Methods',
                    'Track My Order',
                  ].includes(item);

                  return isNavigable ? (
                    <button
                      key={item}
                      onClick={() => handleHelpClick(item)}
                      className='block text-sm md:text-md-regular text-[#FDFDFD] hover:text-white text-left transition-colors font-nunito font-normal leading-7 tracking-[-0.02em]'
                    >
                      {item}
                    </button>
                  ) : (
                    <a
                      key={item}
                      href='#'
                      className='block text-sm md:text-md-regular text-[#FDFDFD] hover:text-white font-nunito font-normal leading-7 tracking-[-0.02em]'
                    >
                      {item}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

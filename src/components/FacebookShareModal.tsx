import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getPreviewImageUrl } from '../utils/url';

interface FacebookShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  songUrl: string;
}

export const FacebookShareModal = ({ isOpen, onClose, songTitle, songUrl }: FacebookShareModalProps) => {
  // Create the encoded URL for sharing
  const createEncodedUrl = () => {
    // Create a shareable URL that includes all necessary song data
    const songData = {
      url: songUrl,
      title: songTitle,
      sender: "A Valentine's Friend"
    };
    
    // Base64 encode the song data
    const encodedData = btoa(JSON.stringify(songData));
    
    // Create the full shareable URL including the base URL and path
    const shareableUrl = `${window.location.origin}/#/play/${encodedData}`;
    // console.log('Shareable URL:', shareableUrl); // Debug log
    return shareableUrl;
  };

  // Add meta tags for Facebook sharing when modal opens
  useEffect(() => {
    if (isOpen) {
      const shareableUrl = createEncodedUrl();
      
      // Update Open Graph meta tags
      const metaTags = {
        'og:title': `Valentine's Song: ${songTitle}`,
        'og:description': 'A special Valentine\'s song created just for you ❤️',
        'og:image': getPreviewImageUrl(),
        'og:url': shareableUrl,
        'og:type': 'music.song'
      };

      // Update or create meta tags
      Object.entries(metaTags).forEach(([property, content]) => {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      });
    }
  }, [isOpen, songTitle, songUrl]);

  const handleShare = () => {
    try {
      // Get the shareable URL
      const shareableUrl = createEncodedUrl();
      
      // Create the Facebook share URL with additional parameters
      const facebookShareUrl = new URL('https://www.facebook.com/sharer/sharer.php');
      facebookShareUrl.searchParams.append('u', shareableUrl);
      facebookShareUrl.searchParams.append('quote', `Check out this Valentine's song: ${songTitle}`);
      
      // Open Facebook share dialog in a popup window
      const width = 626;
      const height = 436;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      window.open(
        facebookShareUrl.toString(),
        'facebook-share-dialog',
        `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0,menubar=0`
      );
      
      // console.log('Opening Facebook share dialog with URL:', facebookShareUrl.toString()); // Debug log
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
    }
    
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Share on Facebook
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Share your Valentine's song with your friends and loved ones on Facebook
                  </p>
                  
                  <div className="bg-pink-50 rounded-xl p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span className="text-sm text-gray-600">Your song "{songTitle}" will be shared</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span className="text-sm text-gray-600">Recipients can play the song directly</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span className="text-sm text-gray-600">They can create their own Valentine's song too</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full bg-[#1877F2] text-white px-6 py-3 rounded-xl hover:bg-[#1864D9] 
                      transition-all duration-300 flex items-center justify-center gap-2
                      shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleShare}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Share on Facebook
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 
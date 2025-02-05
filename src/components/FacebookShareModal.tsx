import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getPreviewImageUrl, createShareableSongUrl } from '../utils/url';

interface FacebookShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  songUrl: string;
}

export const FacebookShareModal = ({ isOpen, onClose, songTitle, songUrl }: FacebookShareModalProps) => {
  // Add meta tags for Facebook sharing when modal opens
  useEffect(() => {
    if (isOpen) {
      // Create meta tags if they don't exist
      const metaTags = {
        'og:title': `Valentine's Song: ${songTitle}`,
        'og:description': 'A special Valentine\'s song created just for you ❤️',
        'og:image': getPreviewImageUrl(),
        'og:url': createShareableSongUrl(songUrl),
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
    // Create the shareable URL with proper encoding
    const shareUrl = createShareableSongUrl(songUrl);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    // Construct Facebook share dialog URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    // Open Facebook share dialog in a popup window
    const width = 626;
    const height = 436;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      facebookShareUrl,
      'facebook-share-dialog',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <img
                      src={getPreviewImageUrl()}
                      alt="Valentine's Song Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1">{songTitle}</h4>
                      <p className="text-sm text-gray-500">
                        A special Valentine's song created just for you ❤️
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleShare}
                  >
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
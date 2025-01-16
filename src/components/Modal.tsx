import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[calc(100vw-24px)] md:max-w-md">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        {children}
      </div>
    </div>
  );
} 
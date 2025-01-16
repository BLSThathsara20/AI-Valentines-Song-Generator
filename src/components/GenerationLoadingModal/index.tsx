export function GenerationLoadingModal({ isOpen, onClose, onEmailSubmit, defaultEmail = '' }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [showEmailInput, setShowEmailInput] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailSubmit(email);
    setShowEmailInput(false);
    setShowSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          {showEmailInput ? (
            <>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Get Notified When Your Song is Ready! 💝</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Notify Me
                </button>
              </form>
            </>
          ) : showSuccess ? (
            <div className="animate-fade-in mb-2">
              <div className="text-green-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium">Email saved successfully!</p>
              <p className="text-gray-600 text-sm">We'll notify you when your song is ready.</p>
            </div>
          ) : null}
          
          <div className="mt-2">
            <div className="flex justify-center">
              <div className="animate-bounce-subtle">
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-gray-600">Crafting your perfect Valentine's melody...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
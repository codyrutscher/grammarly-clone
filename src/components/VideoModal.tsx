import { useEffect } from 'react';
import { useDarkModeStore } from '../store/useDarkModeStore';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
}

export function VideoModal({ isOpen, onClose, videoSrc, title = "Demo Video" }: VideoModalProps) {
  const { isDarkMode } = useDarkModeStore();

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`text-2xl transition-colors hover:opacity-70 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ×
          </button>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          <video
            controls
            autoPlay
            className="w-full h-auto max-h-[70vh]"
            poster="/video-poster.jpg" // Optional: Add a poster image
          >
            <source src={videoSrc} type="video/mp4" />
            <p className="text-white p-4">
              Your browser doesn't support video playback. 
              <a href={videoSrc} className="text-blue-400 hover:underline ml-1">
                Download the video instead
              </a>
            </p>
          </video>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t transition-colors ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <p className={`text-sm transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              See StudyWrite in action! This demo shows our key features for student writers.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
} 
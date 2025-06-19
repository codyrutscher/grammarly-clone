import { useDarkModeStore } from '../store/useDarkModeStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  message?: string;
}

export function UpgradePrompt({ isOpen, onClose, onUpgrade, message }: UpgradePromptProps) {
  const { isDarkMode } = useDarkModeStore();
  const { documentsUsed, maxDocuments } = useSubscriptionStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-xl p-6 transition-all ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
          
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {message || `You've used ${documentsUsed} of ${maxDocuments} free documents this month. Upgrade to Premium for unlimited documents!`}
          </p>

          <div className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h4 className="font-semibold mb-2 text-blue-600">What you get with Premium:</h4>
            <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>🚀 <strong>Unlimited documents</strong> (vs 5 free documents/month)</li>
              <li>✅ Keep all the same great features you already have</li>
              <li>📝 No other restrictions or limitations</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Maybe Later
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
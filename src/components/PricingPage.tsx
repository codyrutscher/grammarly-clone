import { useDarkModeStore } from '../store/useDarkModeStore';

interface PricingPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingPage({ isOpen, onClose }: PricingPageProps) {
  const { isDarkMode } = useDarkModeStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex justify-between items-center p-6 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            StudyWrite Pricing
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-12">
            <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Simple, Transparent Pricing
            </h3>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose the plan that works best for your writing needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Free Plan */}
            <div className={`rounded-xl p-8 border-2 transition-all ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700/50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center mb-8">
                <h4 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Free
                </h4>
                <div className="text-4xl font-bold text-blue-600 mb-2">$0</div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Perfect for trying out StudyWrite
                </p>
              </div>
              
              <ul className={`space-y-4 mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time grammar and spell checking</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI-powered writing suggestions</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Style and tone analysis</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Team collaboration features</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Document sharing and export</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Academic writing support</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-orange-600 font-medium">Limited to 5 documents per month</span>
                </li>
              </ul>

              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Perfect for students just getting started
                </p>
              </div>
            </div>

            {/* Premium Plan */}
            <div className={`rounded-xl p-8 border-2 relative transition-all ${
              isDarkMode 
                ? 'border-blue-500 bg-blue-900/20' 
                : 'border-blue-500 bg-blue-50'
            }`}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h4 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Premium
                </h4>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  $5<span className="text-lg font-normal">/month</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Full access to all features
                </p>
              </div>
              
              <ul className={`space-y-4 mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in Free plan</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-blue-600 font-bold">UNLIMITED documents per month</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced analytics and insights</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Enhanced team management tools</span>
                </li>
              </ul>

              <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-blue-800/50' : 'bg-blue-100'}`}>
                <p className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Ideal for serious writers and students
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={`text-center space-y-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h5 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                How to Upgrade
              </h5>
              <p className="mb-4">
                To upgrade to Premium, simply sign up for a free account and access the upgrade option from within the application.
              </p>
              <p className="text-sm">
                ✓ Cancel anytime • ✓ Secure PayPal payments • ✓ No hidden fees
              </p>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h5 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions
              </h5>
              <div className="space-y-3 text-left max-w-2xl mx-auto">
                <div>
                  <p className="font-medium">Can I change plans anytime?</p>
                  <p className="text-sm">Yes, you can upgrade or downgrade your plan at any time from within the app.</p>
                </div>
                <div>
                  <p className="font-medium">What happens if I exceed 5 documents on the free plan?</p>
                  <p className="text-sm">You'll be prompted to upgrade to Premium for unlimited document access.</p>
                </div>
                <div>
                  <p className="font-medium">Is there a student discount?</p>
                  <p className="text-sm">Our free plan is designed to be generous for students. Premium is already priced affordably at just $5/month.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
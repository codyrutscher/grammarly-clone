import { useEffect, useState } from 'react';
import { useDarkModeStore } from '../store/useDarkModeStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

// PayPal types
declare global {
  interface Window {
    paypal?: any;
  }
}

interface PricingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingPanel({ isOpen, onClose }: PricingPanelProps) {
  const { isDarkMode } = useDarkModeStore();
  const { subscriptionType, setSubscription } = useSubscriptionStore();
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);

  // Load PayPal SDK when modal opens
  useEffect(() => {
    if (isOpen && !window.paypal) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AVbw_NO4dcbC-ZbzqzBkWuzhI_5D3pBZoCmfc29aCquHdga0lHxIZIPbLI3qCFY5wO_mOZSfhwAo5fQM&vault=true&intent=subscription';
      script.onload = () => {
        renderPayPalButton();
      };
      document.body.appendChild(script);
    } else if (isOpen && window.paypal) {
      renderPayPalButton();
    }
  }, [isOpen]);

  const renderPayPalButton = () => {
    const container = document.getElementById('paypal-button-container');
    if (container && window.paypal) {
      container.innerHTML = ''; // Clear any existing buttons
      
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(_data: any, actions: any) {
          return actions.subscription.create({
            plan_id: 'P-41W63194FL822090CNBJOTNI'
          });
        },
        onApprove: function(data: any, _actions: any) {
          // Update subscription status
          setSubscription(data.subscriptionID, 'premium');
          alert(`Subscription successful! Welcome to Premium!`);
          // Here you would typically also:
          // 1. Save subscription ID to your database
          // 2. Send confirmation email
          onClose();
        },
        onError: function(err: any) {
          console.error('PayPal subscription error:', err);
          alert('There was an error processing your subscription. Please try again.');
        }
      }).render('#paypal-button-container');
    }
  };

  const handleDowngrade = () => {
    setSubscription(null, 'free');
    setShowDowngradeConfirm(false);
    alert('Your plan has been downgraded to Free. You will retain access to Premium features until your current billing period ends.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Plan
          </h2>
          <button
            onClick={onClose}
            className={`text-2xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className={`rounded-xl p-6 border-2 transition-all ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700/50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="text-center mb-6">
              <h3 className={`text-xl font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Free
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
              <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Perfect for trying out StudyWrite
              </p>
            </div>
            
            <ul className={`space-y-3 mb-6 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                All grammar checking features
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                All AI writing features
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Team collaboration
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Academic style support
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">⚠️</span>
                <span className="text-orange-600 font-medium">Limited to 5 documents per month</span>
              </li>
            </ul>
            
            {subscriptionType === 'free' ? (
              <button 
                className="w-full py-3 px-4 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
                disabled
              >
                Current Plan
              </button>
            ) : (
              <button 
                onClick={() => setShowDowngradeConfirm(true)}
                className={`w-full py-3 px-4 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                ⬇️ Downgrade to Free
              </button>
            )}
          </div>

          {/* Premium Plan */}
          <div className={`rounded-xl p-6 border-2 relative transition-all ${
            isDarkMode 
              ? 'border-blue-500 bg-blue-900/20' 
              : 'border-blue-500 bg-blue-50'
          }`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Recommended
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className={`text-xl font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Premium
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                $5<span className="text-lg font-normal">/month</span>
              </div>
              <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Full access to all features
              </p>
            </div>
            
            <ul className={`space-y-3 mb-6 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                All grammar checking features
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                All AI writing features
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Team collaboration
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Academic style support
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">🚀</span>
                <span className="text-blue-600 font-bold">UNLIMITED documents</span>
              </li>
            </ul>
            
            {subscriptionType === 'premium' ? (
              <button 
                className="w-full py-3 px-4 rounded-lg bg-green-500 text-white cursor-not-allowed"
                disabled
              >
                ✓ Current Plan
              </button>
            ) : (
              <div id="paypal-button-container" className="w-full"></div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cancel anytime 
          </p>
          <div className="mt-4 flex justify-center items-center space-x-4">
            <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" className="h-6" />
            <span className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Secure payments powered by PayPal
            </span>
          </div>
        </div>
      </div>

      {/* Downgrade Confirmation Modal */}
      {showDowngradeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className={`rounded-xl p-6 max-w-md w-full transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Downgrade
            </h3>
            <p className={`text-sm mb-6 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to downgrade to the Free plan? You will:
            </p>
            <ul className={`text-sm space-y-2 mb-6 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">⚠️</span>
                Be limited to 5 documents per month
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">ℹ️</span>
                Keep Premium access until your billing period ends
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Still have access to all core features
              </li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDowngradeConfirm(false)}
                className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDowngrade}
                className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
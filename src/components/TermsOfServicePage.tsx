import { useDarkModeStore } from '../store/useDarkModeStore'

interface TermsOfServicePageProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsOfServicePage({ isOpen, onClose }: TermsOfServicePageProps) {
  const { isDarkMode } = useDarkModeStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex justify-between items-center p-6 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Terms of Service
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
        <div className="p-6 space-y-6">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: January 1, 2025
          </div>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Acceptance of Terms
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                By accessing and using StudyWrite, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Contact Information
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                If you have questions about these terms, please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> <a href="mailto:codyrutscher@gmail.com" className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>codyrutscher@gmail.com</a>
                </p>
                <p>
                  <strong>Phone:</strong> <a href="tel:+19139527461" className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>913-952-7461</a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 
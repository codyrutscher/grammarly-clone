import { useDarkModeStore } from '../store/useDarkModeStore'

interface PrivacyPolicyPageProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyPolicyPage({ isOpen, onClose }: PrivacyPolicyPageProps) {
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
            Privacy Policy
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
              1. Information We Collect
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>Account Information:</strong> When you create an account, we collect your email address, name, and password (encrypted).
              </p>
              <p>
                <strong>Writing Content:</strong> We temporarily process your documents to provide grammar checking and AI assistance. Your content is encrypted and not permanently stored on our servers.
              </p>
              <p>
                <strong>Usage Data:</strong> We collect anonymous analytics about how you use StudyWrite to improve our service, including feature usage and performance metrics.
              </p>
              <p>
                <strong>Device Information:</strong> We collect basic device and browser information for security and compatibility purposes.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. How We Use Your Information
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>Service Provision:</strong> To provide grammar checking, AI writing assistance, and document management features.
              </p>
              <p>
                <strong>Account Management:</strong> To manage your account, process payments, and provide customer support.
              </p>
              <p>
                <strong>Service Improvement:</strong> To analyze usage patterns and improve our AI models and features.
              </p>
              <p>
                <strong>Communication:</strong> To send important service updates, security notifications, and respond to your inquiries.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3. Data Security and Protection
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
              </p>
              <p>
                <strong>Access Controls:</strong> Strict access controls ensure only authorized personnel can access systems, and never your content.
              </p>
              <p>
                <strong>Data Minimization:</strong> We collect only the minimum data necessary to provide our services.
              </p>
              <p>
                <strong>Regular Security Audits:</strong> We conduct regular security assessments and penetration testing.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4. Data Sharing and Disclosure
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>We Never Share Your Writing:</strong> Your documents and writing content are never shared with third parties, sold, or used for advertising.
              </p>
              <p>
                <strong>Service Providers:</strong> We may share limited technical data with trusted service providers (hosting, analytics) under strict confidentiality agreements.
              </p>
              <p>
                <strong>Legal Requirements:</strong> We may disclose information only when required by law or to protect our rights and users' safety.
              </p>
              <p>
                <strong>Team Collaboration:</strong> When you share documents with team members, only those specific users can access the shared content.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Your Rights and Choices
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>Access:</strong> You can access and download all your data through your account settings.
              </p>
              <p>
                <strong>Correction:</strong> You can update your account information and preferences at any time.
              </p>
              <p>
                <strong>Deletion:</strong> You can delete your account and all associated data permanently from your account settings.
              </p>
              <p>
                <strong>Data Portability:</strong> You can export your documents in multiple formats (PDF, Word, plain text).
              </p>
              <p>
                <strong>Opt-out:</strong> You can opt out of non-essential communications and analytics collection.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Data Retention
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>Active Accounts:</strong> We retain your account data as long as your account is active.
              </p>
              <p>
                <strong>Deleted Accounts:</strong> When you delete your account, all personal data is permanently removed within 30 days.
              </p>
              <p>
                <strong>Document Processing:</strong> Documents are processed in memory and not permanently stored on our servers.
              </p>
              <p>
                <strong>Analytics Data:</strong> Anonymous usage analytics are retained for up to 2 years for service improvement.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7. International Users
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                StudyWrite is operated from the United States. If you're using our service from outside the US, your data may be transferred to and processed in the US. We ensure appropriate safeguards are in place for international data transfers.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8. Children's Privacy
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                StudyWrite is designed for users 13 years and older. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Changes to This Policy
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                We may update this privacy policy from time to time. We will notify you of any material changes by email and by posting a notice in the application. Your continued use of StudyWrite after such changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10. Contact Us
            </h3>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us:
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
import { useDarkModeStore } from '../store/useDarkModeStore'

interface IntegrationsPageProps {
  isOpen: boolean
  onClose: () => void
}

export function IntegrationsPage({ isOpen, onClose }: IntegrationsPageProps) {
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
            StudyWrite Integrations
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
        <div className="p-6 space-y-8">
          {/* Browser Extensions */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🌐 Browser Extensions
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Chrome Extension
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Check your writing on Gmail, Google Docs, social media, and any web text field.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Firefox Add-on
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Seamless writing assistance across all Firefox-supported websites.
                </p>
              </div>
            </div>
          </section>

          {/* Office Integrations */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📄 Office Suite Integration
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Microsoft Word
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Direct integration with Word documents for seamless editing and suggestions.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Google Docs
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Real-time suggestions and corrections while working in Google Docs.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  LibreOffice
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Open-source office suite compatibility for all users.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Apple Pages
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Native support for Mac users working with Apple's word processor.
                </p>
              </div>
            </div>
          </section>

          {/* Learning Management Systems */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🎓 Learning Management Systems
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Canvas
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Check your assignments and discussions directly within Canvas.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Blackboard
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Seamless integration with Blackboard's assignment submission system.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Moodle
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Support for Moodle forums, assignments, and text submissions.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  D2L Brightspace
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Compatible with D2L's discussion boards and assignment tools.
                </p>
              </div>
            </div>
          </section>

          {/* Mobile Apps */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📱 Mobile Applications
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  iOS App
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Native iPhone and iPad app with full writing assistance capabilities.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Android App
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Android application with keyboard integration and offline capabilities.
                </p>
              </div>
            </div>
          </section>

          {/* API & Developer Tools */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🔧 Developer Tools
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  REST API
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Integrate StudyWrite's grammar checking into your own applications.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  SDK Libraries
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  JavaScript, Python, and Java libraries for easy integration.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Webhooks
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Real-time notifications and automated workflows for your applications.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Custom Widgets
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Embeddable writing assistance widgets for websites and applications.
                </p>
              </div>
            </div>
          </section>

          {/* Coming Soon */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🚀 Coming Soon
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Slack Integration
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Check your messages and posts before sending in Slack channels.
                </p>
              </div>
              <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Notion Integration
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Writing assistance directly within your Notion workspace and documents.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 
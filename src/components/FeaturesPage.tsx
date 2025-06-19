import { useDarkModeStore } from '../store/useDarkModeStore'

interface FeaturesPageProps {
  isOpen: boolean
  onClose: () => void
}

export function FeaturesPage({ isOpen, onClose }: FeaturesPageProps) {
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
            StudyWrite Features
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
          {/* Core Writing Features */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📝 Core Writing Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Real-time Grammar Checking
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Advanced AI-powered grammar and spell checking that catches errors as you type.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Style & Tone Analysis
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Get suggestions to improve clarity, conciseness, and overall writing style.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  AI Writing Assistant
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Interactive AI chat to help with writing ideas, structure, and improvements.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Auto-Save & Sync
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Never lose your work with automatic cloud synchronization across devices.
                </p>
              </div>
            </div>
          </section>

          {/* Academic Features */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🎓 Academic Writing Support
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Citation Styles
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Support for MLA, APA, Chicago, and Harvard citation formats.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Language Variants
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  US, UK, Australian, and Canadian English support for international students.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Academic Tone Detection
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ensures your writing maintains appropriate academic formality and tone.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Speed Mode
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Quick proofreading mode for last-minute assignments and tight deadlines.
                </p>
              </div>
            </div>
          </section>

          {/* Collaboration Features */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              👥 Collaboration & Sharing
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Team Management
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Create teams, invite members, and collaborate on writing projects.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Document Sharing
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Share documents with full editing permissions for seamless collaboration.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Real-time Collaboration
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Work together on documents with live editing and instant updates.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Export Options
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Export your documents to PDF, Word, or plain text formats.
                </p>
              </div>
            </div>
          </section>

          {/* Analytics & Insights */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Analytics & Insights
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Writing Analytics
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Track readability, word count, sentence complexity, and writing patterns.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Progress Tracking
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Monitor your writing improvement over time with detailed reports.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Error Patterns
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Identify common mistakes and get personalized learning recommendations.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Performance Metrics
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Comprehensive statistics on writing speed, accuracy, and improvement.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 
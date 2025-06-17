import { useState } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { useAuthProvider } from './hooks/useAuthProvider'
import { useProfileProvider } from './hooks/useProfileProvider'
import { useAutoSave } from './hooks/useAutoSave'
import { DarkModeToggle } from './components/DarkModeToggle'
import { useDarkModeStore } from './store/useDarkModeStore'
import { useDocumentStore } from './store/useDocumentStore'
import { useProfileStore } from './store/useProfileStore'
import { AuthModal } from './components/AuthModal'
import { DocumentSidebar } from './components/DocumentSidebar'
import { TextEditor } from './components/TextEditor'
import { AnalysisPanel } from './components/AnalysisPanel'
import { AIChatPanel } from './components/AIChatPanel'
import { UserProfileModal } from './components/UserProfileModal'
import { WritingSettingsPanel } from './components/WritingSettingsPanel'
import { logout } from './utils/firebaseUtils'

function App() {
  useAuthProvider()
  useProfileProvider()
  
  const { user, loading } = useAuthStore()
  const { profile, loading: profileLoading } = useProfileStore()
  const { isDarkMode } = useDarkModeStore()
  
  // Debug logging
  console.log('App state:', { user: !!user, profile: !!profile, profileLoading })
  const { currentDocument } = useDocumentStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [showAIChatPanel, setShowAIChatPanel] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showWritingSettings, setShowWritingSettings] = useState(false)
  
  const { saveStatus } = useAutoSave()

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-grammarly-blue border-t-transparent mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">Loading Grammarly Clone...</p>
            <p className="text-sm text-gray-500">Preparing your writing workspace</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {/* Top section circles */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse z-0"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse z-0" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-16 left-1/3 w-20 h-20 bg-indigo-200 rounded-full opacity-15 animate-pulse z-0" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-8 right-1/3 w-16 h-16 bg-pink-200 rounded-full opacity-25 animate-pulse z-0" style={{animationDelay: '1.5s'}}></div>
          
          
          
          
          {/* Additional scattered circles */}
          <div className="absolute top-3/4 left-1/5 w-14 h-14 bg-sky-200 rounded-full opacity-19 animate-pulse z-0" style={{animationDelay: '5s'}}></div>
          <div className="absolute top-1/4 right-1/5 w-30 h-30 bg-fuchsia-200 rounded-full opacity-14 animate-pulse z-0" style={{animationDelay: '5.5s'}}></div>
        </div>

        {/* Header */}
        <nav className={`backdrop-blur-md shadow-sm border-b relative z-10 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-grammarly-blue to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-grammarly-blue to-purple-600 bg-clip-text text-transparent">
                  StudyWrite
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <DarkModeToggle size="sm" />
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-grammarly-blue to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ✨ Sign In
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="py-20 px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className={`text-6xl font-bold mb-4 leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">StudyWrite</span>{' '}
                <br />
                <span className="text-4xl">AI Writing Assistant for </span>
                <span className="bg-gradient-to-r from-grammarly-green to-emerald-500 bg-clip-text text-transparent">
                  Students
                </span>
              </h2>
              <h2 className={`text-2xl mb-4 leading-tight transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                A Grammarly Clone for Students
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-grammarly-blue to-purple-600 mx-auto rounded-full"></div>
            </div>
            
            <p className={`text-xl mb-12 leading-relaxed max-w-3xl mx-auto transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Perfect for essays, research papers, and academic writing. Get real-time AI suggestions tailored to 
              <strong> MLA, APA, Chicago</strong> styles with support for <strong>US, UK, Australian, and Canadian English</strong>.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
                isDarkMode 
                  ? 'bg-gray-800/70 border-gray-700/50 hover:border-red-400' 
                  : 'bg-white/70 border-white/20 hover:border-red-200'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className={`text-xl font-bold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Academic Writing Modes</h3>
                <p className={`leading-relaxed transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  MLA, APA, Chicago, and Harvard style support for essays, research papers, and thesis writing
                </p>
              </div>
              
              <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
                isDarkMode 
                  ? 'bg-gray-800/70 border-gray-700/50 hover:border-blue-400' 
                  : 'bg-white/70 border-white/20 hover:border-blue-200'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className={`text-xl font-bold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Speed Mode</h3>
                <p className={`leading-relaxed transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Quick proofreading for last-minute assignments with critical error detection
                </p>
              </div>
              
              <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
                isDarkMode 
                  ? 'bg-gray-800/70 border-gray-700/50 hover:border-orange-400' 
                  : 'bg-white/70 border-white/20 hover:border-orange-200'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className={`text-xl font-bold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Language Variants</h3>
                <p className={`leading-relaxed transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  US, UK, Australian, and Canadian English support for international students
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-grammarly-green to-emerald-500 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📚 Start Writing Better
            </button>
            
            <p className="text-sm text-gray-500 mt-4">Perfect for students • Free forever • No credit card required</p>
          </div>
        </div>

        {/* Features Section */}
        <div className={`py-20 relative z-10 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-4xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Powered by <span className="text-blue-600">AI Technology</span>
              </h2>
              <p className={`text-xl max-w-3xl mx-auto transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Our advanced AI engine analyzes your writing contextually, providing intelligent suggestions that understand meaning, not just patterns.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors ${
                  isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Real-time Analysis</h3>
                <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get suggestions as you type with lightning-fast AI processing</p>
              </div>
              
              <div className="text-center p-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors ${
                  isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
                }`}>
                  <span className="text-2xl">🎤</span>
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Voice Notes</h3>
                <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Record voice memos and convert speech to text instantly</p>
              </div>
              
              <div className="text-center p-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors ${
                  isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
                }`}>
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Plagiarism Detection</h3>
                <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Check for originality with comprehensive plagiarism analysis</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Save</h3>
                <p className="text-gray-600 text-sm">Never lose your work with automatic cloud synchronization</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
                <p className="text-gray-600 text-sm">Track your writing progress with comprehensive insights</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Context Aware</h3>
                <p className="text-gray-600 text-sm">AI understands your writing context for smarter suggestions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student User Stories Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built for <span className="text-blue-600">Every Student</span>
              </h2>
              <p className="text-xl text-gray-600">See how StudyWrite helps students across different scenarios</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Struggling Essay Writer */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Struggling Essay Writer</h3>
                    <p className="text-gray-600 text-sm">College Freshman</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "As a freshman, I need real-time help with my essays. StudyWrite catches my grammar mistakes and helps me improve my writing style instantly."
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-sm font-medium">✨ Perfect for: Real-time AI assistance</p>
                </div>
              </div>
              
              {/* Procrastinating Research Writer */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Research Paper Writer</h3>
                    <p className="text-gray-600 text-sm">Graduate Student</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Working on my thesis with tight deadlines. The academic style modes help me maintain proper APA formatting throughout my research."
                </p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">🎓 Perfect for: Academic style support</p>
                </div>
              </div>
              
              {/* International Student */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">International Student</h3>
                    <p className="text-gray-600 text-sm">ESL Learner</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "English is my second language. The language variant settings help me write in proper American English for my university assignments."
                </p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-800 text-sm font-medium">🌍 Perfect for: Language variant support</p>
                </div>
              </div>
              
              {/* Perfectionist Overachiever */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Perfectionist Student</h3>
                    <p className="text-gray-600 text-sm">Pre-Med Student</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Every assignment needs to be perfect for med school applications. StudyWrite's comprehensive analysis ensures my writing is flawless."
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium">🔍 Perfect for: Comprehensive analysis</p>
                </div>
              </div>
              
              {/* Group Project Member */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Group Project Leader</h3>
                    <p className="text-gray-600 text-sm">Business Student</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Coordinating writing across team members. StudyWrite helps maintain consistent style and quality in our collaborative documents."
                </p>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-indigo-800 text-sm font-medium">📊 Perfect for: Consistent style</p>
                </div>
              </div>
              
              {/* Last-Minute Assignment Rusher */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Last-Minute Rusher</h3>
                    <p className="text-gray-600 text-sm">Busy Student</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Assignment due in 2 hours! Speed Mode helps me quickly catch critical errors and submit quality work on time."
                </p>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">⚡ Perfect for: Speed Mode proofreading</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Simple, <span className="text-green-600">Transparent</span> Pricing
              </h2>
              <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-300 transition-all duration-300">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Up to 5 documents
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Basic AI suggestions
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Grammar & spelling check
                    </li>
                  </ul>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Get Started Free
                  </button>
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl p-8 relative transform scale-105 shadow-xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">$12</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited documents
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Advanced AI suggestions
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Style & tone analysis
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Priority support
                    </li>
                  </ul>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start Pro Trial
                  </button>
                </div>
              </div>
              
              {/* Team Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-300 transition-all duration-300">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Team</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">$30</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Up to 10 team members
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Shared workspaces
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Team analytics
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Admin controls
                    </li>
                  </ul>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-grammarly-blue to-purple-600 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Writing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of writers who have improved their communication with our AI-powered writing assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🚀 Start Writing Better Today
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                📞 Talk to Sales
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-6">No credit card required • 14-day free trial</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-grammarly-blue to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <h3 className="text-2xl font-bold">Grammarly Clone</h3>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  AI-powered writing assistant that helps you communicate more effectively with intelligent suggestions and real-time feedback.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Grammarly Clone. All rights reserved. Powered by AI technology.</p>
            </div>
          </div>
        </footer>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    )
  }

  return (
    <div className={`h-screen flex transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <DocumentSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className={`backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-grammarly-blue to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-grammarly-blue to-purple-600 bg-clip-text text-transparent">
                StudyWrite
              </h1>
            </div>
            {currentDocument && (
              <div className="flex">
                <span className="text-gray-400">•</span>
                <span className={`font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentDocument.title}</span>
                {/* Save status indicator */}
                <div className="flex items-center space-x-1 ml-2 mr-4">
                  {saveStatus === 'saving' && (
                    <>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-yellow-600 text-xs">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-600 text-xs">Saved</span>
                    </>
                  )}
                  {saveStatus === 'unsaved' && (
                    <>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-red-600 text-xs">Unsaved changes</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <DarkModeToggle size="sm" />
            <button
              onClick={() => setShowWritingSettings(true)}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg font-medium ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600' 
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700'
              }`}
            >
              ⚙️ Writing Settings
            </button>
            <button
              onClick={() => setShowAnalysisPanel(true)}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg font-medium ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white hover:from-green-600 hover:to-emerald-500' 
                  : 'bg-gradient-to-r from-grammarly-green to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
              }`}
            >
              📊 Analysis
            </button>
            <button
              onClick={() => setShowAIChatPanel(true)}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg font-medium ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              🤖 AI Assistant
            </button>
            <div className={`flex items-center space-x-3 pl-3 border-l transition-colors ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowProfileModal(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 border-gray-600 hover:border-gray-500' 
                    : 'hover:bg-blue-50 border-transparent hover:border-blue-200'
                }`}
                title="Manage Profile"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-blue-600 text-lg">👤</span>
                </div>
                <div className="text-sm">
                  <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome,</div>
                  <div className={`font-medium transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {profileLoading ? 'Loading...' : (profile?.displayName || profile?.firstName || user?.email?.split('@')[0] || 'User')}
                  </div>
                </div>
                <svg className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowProfileModal(true)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title="Profile Settings"
              >
                ⚙️ Profile
              </button>
              
              <button
                onClick={handleLogout}
                className={`text-sm px-3 py-1.5 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Editor */}
        <TextEditor />
      </div>

      {/* Analysis Panel */}
      <AnalysisPanel
        isOpen={showAnalysisPanel}
        onClose={() => setShowAnalysisPanel(false)}
      />

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={showAIChatPanel}
        onClose={() => setShowAIChatPanel(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Writing Settings Panel */}
      <WritingSettingsPanel
        isOpen={showWritingSettings}
        onClose={() => setShowWritingSettings(false)}
        onSettingsChange={() => {}}
      />
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { useAuthProvider } from './hooks/useAuthProvider'
import { useProfileProvider } from './hooks/useProfileProvider'
import { useAutoSave } from './hooks/useAutoSave'
import { DarkModeToggle } from './components/DarkModeToggle'
import { useDarkModeStore } from './store/useDarkModeStore'
import { useProfileStore } from './store/useProfileStore'
import { useTeamStore } from './store/useTeamStore'
import { AuthModal } from './components/AuthModal'
import { DocumentSidebar } from './components/DocumentSidebar'
import { TextEditor } from './components/TextEditor'
import { AnalysisPanel } from './components/AnalysisPanel'
import { AIChatPanel } from './components/AIChatPanel'
import { UserProfileModal } from './components/UserProfileModal'
import { WritingSettingsPanel } from './components/WritingSettingsPanel'
import { TeamManagementPanel } from './components/TeamManagementPanel'
import { DocumentSharingPanel } from './components/DocumentSharingPanel'
import { PricingPanel } from './components/PricingPanel'
import { VideoModal } from './components/VideoModal'
import { UpgradePrompt } from './components/UpgradePrompt'
import { useSubscriptionStore } from './store/useSubscriptionStore'
import { logout } from './utils/firebaseUtils'
import { getUserTeams } from './utils/teamService'
import { FeaturesPage } from './components/FeaturesPage'
import { IntegrationsPage } from './components/IntegrationsPage'
import { HelpCenterPage } from './components/HelpCenterPage'
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage'
import { TermsOfServicePage } from './components/TermsOfServicePage'

function App() {
  useAuthProvider()
  useProfileProvider()
  
  const { user, loading } = useAuthStore()
  const { profile, loading: profileLoading } = useProfileStore()
  const { setUserTeams } = useTeamStore()
  const { isDarkMode } = useDarkModeStore()
  const { subscriptionType, documentsUsed, maxDocuments } = useSubscriptionStore()
  
  // Load user teams when user logs in
  useEffect(() => {
    const loadTeams = async () => {
      if (user) {
        try {
          console.log('Loading teams for user:', user.uid)
          const teams = await getUserTeams(user.uid)
          console.log('Loaded teams:', teams.length)
          setUserTeams(teams)
        } catch (error) {
          console.error('Error loading teams:', error)
        }
      } else {
        // Clear teams when user logs out
        setUserTeams([])
      }
    }
    
    loadTeams()
  }, [user, setUserTeams])
  
  // Debug logging
  console.log('App state:', { user: !!user, profile: !!profile, profileLoading })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [showAIChatPanel, setShowAIChatPanel] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showWritingSettings, setShowWritingSettings] = useState(false)
  const [showTeamManagement, setShowTeamManagement] = useState(false)
  const [showDocumentSharing, setShowDocumentSharing] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [showFeaturesPage, setShowFeaturesPage] = useState(false)
  const [showIntegrationsPage, setShowIntegrationsPage] = useState(false)
  const [showHelpCenterPage, setShowHelpCenterPage] = useState(false)
  const [showPrivacyPolicyPage, setShowPrivacyPolicyPage] = useState(false)
  const [showTermsOfServicePage, setShowTermsOfServicePage] = useState(false)
  
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-grammarly-green to-emerald-500 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📚 Start Writing Better
              </button>
              
              <button
                onClick={() => setShowVideoModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                🎥 Watch Demo
              </button>
            </div>
            
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
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Auto-Save</h3>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Never lose your work with automatic cloud synchronization</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detailed Analytics</h3>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Track your writing progress with comprehensive insights</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Context Aware</h3>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI understands your writing context for smarter suggestions</p>
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
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-orange-300 transition-all duration-300">
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
                      All grammar checking features
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All AI writing features
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Team collaboration
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Academic style support
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-orange-600 font-medium">Limited to 5 documents/month</span>
                    </li>
                  </ul>
                  <div className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-lg text-center font-medium">
                    Available Now - Sign Up Above
                  </div>
                </div>
              </div>
              
              {/* Premium Plan */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl p-8 relative transform scale-105 shadow-xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Recommended</span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">$5</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All grammar checking features
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All AI writing features
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Team collaboration
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Academic style support
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-blue-600 font-bold">UNLIMITED documents</span>
                    </li>
                  </ul>
                  <div className="w-full bg-blue-100 text-blue-600 py-3 px-6 rounded-lg text-center font-medium">
                    Upgrade Available in App
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-grammarly-blue to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <h3 className="text-2xl font-bold">StudyWrite</h3>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  AI-powered writing assistant that helps students communicate more effectively with intelligent suggestions and real-time feedback.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => setShowFeaturesPage(true)} className="hover:text-white transition-colors text-left">Features</button></li>
                  <li><button onClick={() => setShowAuthModal(true)} className="hover:text-white transition-colors text-left">Pricing</button></li>
                  
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => setShowHelpCenterPage(true)} className="hover:text-white transition-colors text-left">Help Center</button></li>
                  <li><button onClick={() => setShowPrivacyPolicyPage(true)} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                  <li><button onClick={() => setShowTermsOfServicePage(true)} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2025 StudyWrite. All rights reserved. Powered by AI technology.</p>
            </div>
          </div>
        </footer>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        <PricingPanel
          isOpen={showPricing}
          onClose={() => setShowPricing(false)}
        />

        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoSrc="/demo-video.mp4"
          title="StudyWrite Demo - AI Writing Assistant for Students"
        />

        {/* Footer Page Modals */}
        <FeaturesPage
          isOpen={showFeaturesPage}
          onClose={() => setShowFeaturesPage(false)}
        />

        <IntegrationsPage
          isOpen={showIntegrationsPage}
          onClose={() => setShowIntegrationsPage(false)}
        />

        <HelpCenterPage
          isOpen={showHelpCenterPage}
          onClose={() => setShowHelpCenterPage(false)}
        />

        <PrivacyPolicyPage
          isOpen={showPrivacyPolicyPage}
          onClose={() => setShowPrivacyPolicyPage(false)}
        />

        <TermsOfServicePage
          isOpen={showTermsOfServicePage}
          onClose={() => setShowTermsOfServicePage(false)}
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <nav className={`backdrop-blur-md shadow-lg border-b-2 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-600' 
          : 'bg-white/90 border-gray-300'
      }`}>
        <div className="mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className={`flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0 px-3 py-2 rounded-lg border ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700/50' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-grammarly-blue to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-sm sm:text-lg">S</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-grammarly-blue to-purple-600 bg-clip-text text-transparent truncate">
                StudyWrite
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Subscription Status */}
              {subscriptionType === 'free' && (
                <div className={`hidden sm:flex items-center space-x-2 mr-2 px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-orange-600 bg-orange-900/30' 
                    : 'border-orange-200 bg-orange-50'
                }`}>
                  <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full border border-orange-200">
                    Free ({documentsUsed}/{maxDocuments})
                  </div>
                  <button
                    onClick={() => setShowUpgradePrompt(true)}
                    className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all border border-blue-400 shadow-md"
                  >
                    Upgrade
                  </button>
                </div>
              )}
              {subscriptionType === 'premium' && (
                <div className={`hidden sm:flex items-center space-x-2 mr-2 px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'border-green-600 bg-green-900/30' 
                    : 'border-green-200 bg-green-50'
                }`}>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">
                    ✓ Premium
                  </div>
                  <button
                    onClick={() => setShowPricing(true)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-all border border-gray-300 shadow-sm"
                  >
                    Manage
                  </button>
                </div>
              )}
              
              <div className={`p-1 rounded-lg border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700/50' 
                  : 'border-gray-200 bg-gray-50/50'
              }`}>
                <DarkModeToggle size="sm" />
              </div>
              
              {/* Teams Button */}
              <button
                onClick={() => setShowTeamManagement(true)}
                className="bg-purple-600 text-white px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg hover:bg-purple-700 transition-colors shadow-md border border-purple-500"
              >
                <span className="hidden sm:inline">👥 Teams</span>
                <span className="sm:hidden">👥</span>
              </button>
              
              {/* Share Button */}
              <button
                onClick={() => setShowDocumentSharing(true)}
                className="bg-green-600 text-white px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors shadow-md border border-green-500"
              >
                <span className="hidden sm:inline">🔗 Share</span>
                <span className="sm:hidden">🔗</span>
              </button>
              
              {/* AI Chat Button */}
              <button
                onClick={() => setShowAIChatPanel(true)}
                className="bg-gradient-to-r from-grammarly-blue to-purple-600 text-white px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md border border-blue-400"
              >
                <span className="hidden sm:inline">💬 AI Chat</span>
                <span className="sm:hidden">💬</span>
              </button>
              
              {/* Analysis Button */}
              <button
                onClick={() => setShowAnalysisPanel(true)}
                className="bg-gradient-to-r from-grammarly-green to-emerald-500 text-white px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md border border-green-400"
              >
                <span className="hidden sm:inline">📊 Analysis</span>
                <span className="sm:hidden">📊</span>
              </button>
              
              {/* Subscription Management for Mobile */}
              {subscriptionType === 'premium' && (
                <button
                  onClick={() => setShowPricing(true)}
                  className="sm:hidden bg-green-600 text-white px-2 py-2 text-xs rounded-lg hover:bg-green-700 transition-colors shadow-md border border-green-500"
                  title="Manage Subscription"
                >
                  ⚙️
                </button>
              )}
              
              {/* Profile/Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className={`p-2 rounded-lg transition-colors border shadow-sm ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 border-gray-600 bg-gray-700/50' 
                      : 'text-gray-600 hover:bg-gray-100 border-gray-300 bg-gray-50'
                  }`}
                >
                  <span className="text-lg">👤</span>
                </button>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-colors border shadow-sm ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400 border-gray-600 bg-gray-700/50' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-red-600 border-gray-300 bg-gray-50'
                }`}
              >
                <span className="text-lg">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`w-full lg:w-80 h-48 lg:h-[calc(100vh-4rem)] flex-shrink-0 border-r-2 lg:overflow-hidden shadow-lg ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-800/50' 
            : 'border-gray-300 bg-gray-50/50'
        }`}>
          <DocumentSidebar />
        </div>
        
        {/* Main Editor Area */}
        <div className={`flex-1 flex flex-col border-l ${
          isDarkMode 
            ? 'border-gray-600' 
            : 'border-gray-300'
        }`}>
          {/* Auto-save status */}
          {saveStatus && (
            <div className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              saveStatus === 'saving' 
                ? isDarkMode ? 'bg-yellow-900/50 text-yellow-200 border-yellow-600' : 'bg-yellow-50 text-yellow-800 border-yellow-300'
                : saveStatus === 'saved'
                ? isDarkMode ? 'bg-green-900/50 text-green-200 border-green-600' : 'bg-green-50 text-green-800 border-green-300'
                : isDarkMode ? 'bg-red-900/50 text-red-200 border-red-600' : 'bg-red-50 text-red-800 border-red-300'
            }`}>
              {saveStatus === 'saving' && '💾 Saving...'}
              {saveStatus === 'saved' && '✅ All changes saved'}
              {saveStatus === 'unsaved' && '❌ Unsaved changes'}
            </div>
          )}
          
          <div className={`flex-1 border-2 m-2 rounded-lg shadow-inner ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-800/30' 
              : 'border-gray-200 bg-white'
          }`}>
            <TextEditor />
          </div>
        </div>
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

      {/* Team Management Panel */}
      <TeamManagementPanel
        isOpen={showTeamManagement}
        onClose={() => setShowTeamManagement(false)}
      />

      {/* Document Sharing Panel */}
      <DocumentSharingPanel
        isOpen={showDocumentSharing}
        onClose={() => setShowDocumentSharing(false)}
      />

      {/* Pricing Panel */}
      <PricingPanel
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoSrc="/demo-video.mp4"
        title="StudyWrite Demo - AI Writing Assistant for Students"
      />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          setShowPricing(true);
        }}
      />
    </div>
  )
}

export default App

import { useState } from 'react'
import { useDarkModeStore } from '../store/useDarkModeStore'

interface HelpCenterPageProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpCenterPage({ isOpen, onClose }: HelpCenterPageProps) {
  const { isDarkMode } = useDarkModeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  if (!isOpen) return null

  const faqs = [
    {
      question: "How do I get started with StudyWrite?",
      answer: "Simply create a free account using the sign-up button. You'll get access to 5 documents per month with all core features including grammar checking, AI assistance, and team collaboration."
    },
    {
      question: "What's the difference between Free and Premium plans?",
      answer: "Free users get 5 documents per month with all features. Premium users get unlimited documents, priority support, and advanced analytics. Both plans include full AI assistance and team collaboration."
    },
    {
      question: "Can I use StudyWrite offline?",
      answer: "The web app requires an internet connection for AI features and syncing. However, your documents are cached locally, so you can continue writing even with temporary connectivity issues."
    },
    {
      question: "How accurate is the grammar checking?",
      answer: "StudyWrite uses advanced AI models trained on academic writing. Our accuracy rate is over 95% for common grammar errors, and we continuously improve our algorithms based on user feedback."
    },
    {
      question: "Can I share documents with non-StudyWrite users?",
      answer: "Currently, document sharing requires all collaborators to have StudyWrite accounts. However, you can export documents to share as PDF or Word files with anyone."
    },
    {
      question: "Is my writing data secure and private?",
      answer: "Yes! We use enterprise-grade encryption and never store your documents permanently on our servers. Your data is encrypted in transit and at rest, and we never share your content with third parties."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel anytime from your account settings. Premium features will remain active until the end of your billing period, then your account will automatically switch to the free plan."
    },
    {
      question: "Can StudyWrite help with citation formats?",
      answer: "Yes! StudyWrite supports MLA, APA, Chicago, and Harvard citation styles. Our AI can help format citations and ensure consistency throughout your academic papers."
    }
  ]

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Help Center
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
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Quick Links */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🚀 Quick Start Guides
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Getting Started
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Learn the basics of creating documents and using AI assistance.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Team Collaboration
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Set up teams and share documents with classmates and colleagues.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Academic Writing
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Master citation styles and academic formatting requirements.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Troubleshooting
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Common issues and solutions for technical problems.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ❓ Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className={`border rounded-lg ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className={`w-full p-4 text-left flex justify-between items-center ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {faq.question}
                    </span>
                    <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {expandedFAQ === index ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFAQ === index && (
                    <div className={`p-4 border-t ${
                      isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Contact Support */}
          <section>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📞 Need More Help?
            </h3>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📧</span>
                  <a 
                    href="mailto:codyrutscher@gmail.com"
                    className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    codyrutscher@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📱</span>
                  <a 
                    href="tel:+19139527461"
                    className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    913-952-7461
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">⏰</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Monday - Friday, 9 AM - 5 PM CST
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 
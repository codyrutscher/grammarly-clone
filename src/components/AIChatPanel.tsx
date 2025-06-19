import { useState, useRef, useEffect } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { aiService } from '../utils/aiService';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const { content, setContent } = useDocumentStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI writing assistant. I can help you improve your writing, generate content, or answer questions about writing techniques. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'improve' | 'generate'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const response = await aiService.chatWithAI(chatMessages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success ? response.message! : 
          response.error || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleImproveText = async (type: 'clarity' | 'engagement' | 'tone' | 'structure') => {
    if (!content.trim()) {
      alert('Please write some content first!');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.improveText(content, type);
      
      if (response.success && response.message) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: `Please improve my text for ${type}`,
          timestamp: new Date()
        };

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setActiveTab('chat');
      } else {
        alert(response.error || 'Failed to improve text');
      }
    } catch (error) {
      alert('Error improving text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async (type: 'paragraph' | 'outline' | 'summary' | 'expansion') => {
    if (!input.trim()) {
      alert('Please enter a prompt for content generation!');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.generateContent(input, type);
      
      if (response.success && response.message) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: `Generate ${type}: ${input}`,
          timestamp: new Date()
        };

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setInput('');
        setActiveTab('chat');
      } else {
        alert(response.error || 'Failed to generate content');
      }
    } catch (error) {
      alert('Error generating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const insertTextIntoEditor = (text: string) => {
    setContent(content + '\n\n' + text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full sm:w-96 min-h-screen lg:h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Writing Assistant</h2>
                <p className="text-purple-100 text-sm">Your intelligent writing companion</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-6 space-x-1">
            {[
              { id: 'chat', label: '💬 Chat', icon: '💬' },
              { id: 'improve', label: '✨ Improve', icon: '✨' },
              { id: 'generate', label: '🎯 Generate', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => insertTextIntoEditor(message.content)}
                          className="mt-3 text-xs bg-grammarly-green text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                        >
                          📝 Insert into document
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about writing... ✨"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    🚀
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'improve' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Improve Your Writing</h3>
                <p className="text-sm text-gray-600">
                  Select an improvement type to enhance your document
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleImproveText('clarity')}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-blue-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔍</span>
                    <div className="text-left">
                      <div className="font-semibold">Improve Clarity</div>
                      <div className="text-xs text-blue-600">Make text clearer and more concise</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleImproveText('engagement')}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div className="text-left">
                      <div className="font-semibold">Improve Engagement</div>
                      <div className="text-xs text-green-600">Make content more compelling</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleImproveText('tone')}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-purple-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎭</span>
                    <div className="text-left">
                      <div className="font-semibold">Improve Tone</div>
                      <div className="text-xs text-purple-600">Adjust for professional tone</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleImproveText('structure')}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-orange-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏗️</span>
                    <div className="text-left">
                      <div className="font-semibold">Improve Structure</div>
                      <div className="text-xs text-orange-600">Better organization and flow</div>
                    </div>
                  </div>
                </button>
              </div>
              
              {loading && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Improving your text...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Generate Content</h3>
                <p className="text-sm text-gray-600">
                  Create new content using AI
                </p>
              </div>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your topic or prompt... 💡"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              
              <div className="space-y-3">
                <button
                  onClick={() => handleGenerateContent('paragraph')}
                  disabled={loading || !input.trim()}
                  className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-blue-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📝</span>
                    <div className="text-left">
                      <div className="font-semibold">Generate Paragraph</div>
                      <div className="text-xs text-blue-600">Create a detailed paragraph</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleGenerateContent('outline')}
                  disabled={loading || !input.trim()}
                  className="w-full bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-purple-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📋</span>
                    <div className="text-left">
                      <div className="font-semibold">Create Outline</div>
                      <div className="text-xs text-purple-600">Generate a structured outline</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleGenerateContent('summary')}
                  disabled={loading || !input.trim()}
                  className="w-full bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-purple-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📋</span>
                    <div className="text-left">
                      <div className="font-semibold">Generate Summary</div>
                      <div className="text-xs text-purple-600">Create a concise summary</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleGenerateContent('expansion')}
                  disabled={loading || !input.trim()}
                  className="w-full bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 border border-orange-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔍</span>
                    <div className="text-left">
                      <div className="font-semibold">Expand Ideas</div>
                      <div className="text-xs text-orange-600">Add details and insights</div>
                    </div>
                  </div>
                </button>
              </div>
              
              {loading && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Generating content...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
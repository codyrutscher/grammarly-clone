import { useState, useEffect, useCallback, useRef } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { useSuggestionFeedbackStore } from '../store/useSuggestionFeedbackStore';
import { applySuggestion, getTextStats } from '../utils/grammarChecker';
import { checkTextWithAI } from '../utils/aiGrammarChecker';
import { createDocument } from '../utils/firebaseUtils';
import type { GrammarSuggestion } from '../store/useDocumentStore';
import type { WritingSettings, Suggestion, Document } from '../types';
import { defaultWritingSettings } from '../store/useProfileStore';
import { VoiceNotesPanel } from './VoiceNotesPanel';
import { PlagiarismPanel } from './PlagiarismPanel';
import { PlainTextEditor } from './PlainTextEditor';
import { useDarkModeStore } from '../store/useDarkModeStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { AnalysisPanel } from './AnalysisPanel';

export function TextEditor() {
  const { user } = useAuthStore();
  const { content, setContent, suggestions, setSuggestions, currentDocument, addDocument, setCurrentDocument, updateDocument } = useDocumentStore();
  const { profile } = useProfileStore();
  const { isDarkMode } = useDarkModeStore();
  const [selectedSuggestion, setSelectedSuggestion] = useState<GrammarSuggestion | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [highlightedSuggestionId, setHighlightedSuggestionId] = useState<string | null>(null);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  const [currentWritingSettings, setCurrentWritingSettings] = useState<WritingSettings>(defaultWritingSettings);
  const [showVoiceNotes, setShowVoiceNotes] = useState(false);
  const [showPlagiarismCheck, setShowPlagiarismCheck] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const lastAutoSaveTime = useRef<number>(0);
  const isProgrammaticUpdate = useRef<boolean>(false);
  const lastAppliedSuggestionContent = useRef<string>('');
  const suggestionApplicationTime = useRef<number>(0);
  const currentDocumentId = useRef<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const addFeedback = useSuggestionFeedbackStore(state => state.addFeedback);

  // Check if current document is editable - all shared documents have full access
  const isDocumentEditable = currentDocument && (!currentDocument.isShared || true);
  
  // Debug logging for permissions
  useEffect(() => {
    if (currentDocument) {
      console.log('TextEditor: Current document permissions check:', {
        id: currentDocument.id,
        title: currentDocument.title,
        isShared: currentDocument.isShared,
        isDocumentEditable
      });
    }
  }, [currentDocument, isDocumentEditable]);

  // Update writing settings when profile changes
  useEffect(() => {
    if (profile?.writingSettings) {
      setCurrentWritingSettings(profile.writingSettings);
    }
  }, [profile]);

  // AI analysis function - now purely manual
  const analyzeText = useCallback(
    async (text: string) => {
      if (!text || text.trim().length === 0 || !suggestionsEnabled) {
        setSuggestions([]);
        setHasGeneratedSuggestions(false);
        return;
      }

      setIsAnalyzing(true);
      console.log('Starting manual AI text analysis with settings:', currentWritingSettings);

      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<GrammarSuggestion[]>((_, reject) => {
          setTimeout(() => reject(new Error('Analysis timeout')), 45000); // 45 second timeout
        });

        const analysisPromise = checkTextWithAI(text, currentWritingSettings);
        
        const newSuggestions = await Promise.race([analysisPromise, timeoutPromise]);
        
        console.log('AI analysis complete:', newSuggestions.length, 'suggestions');
        setSuggestions(newSuggestions);
        setHasGeneratedSuggestions(true);
      } catch (error) {
        console.error('Error analyzing text:', error);
        
        // Set empty suggestions but mark as generated to show "no issues found" message
        setSuggestions([]);
        setHasGeneratedSuggestions(true);
        
        // Show user-friendly error message
        if (error instanceof Error && error.message === 'Analysis timeout') {
          console.warn('AI analysis timed out - this may be due to network issues or API limitations');
        } else {
          console.warn('AI analysis failed - this may be due to API configuration or network issues');
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setSuggestions, suggestionsEnabled, currentWritingSettings]
  );

  // Update content when currentDocument changes
  useEffect(() => {
    if (currentDocument) {
      console.log('📄 Document change detected:', {
        id: currentDocument.id,
        title: currentDocument.title,
        contentPreview: currentDocument.content.substring(0, 100),
        contentLength: currentDocument.content.length,
        previousDocumentId: currentDocumentId.current,
        isNewDocument: currentDocumentId.current !== currentDocument.id
      });
      
      // Check if this is actually a new document
      const isNewDocument = currentDocumentId.current !== currentDocument.id;
      
      // Update the tracked document ID
      currentDocumentId.current = currentDocument.id;
      
      // Convert any HTML content to plain text
      let plainText = currentDocument.content;
      if (currentDocument.content.includes('<') && currentDocument.content.includes('>')) {
        console.log('Converting HTML content to plain text');
        plainText = currentDocument.content
          .replace(/<\/p>/gi, '\n')        // End of paragraph = newline
          .replace(/<p[^>]*>/gi, '')       // Remove opening p tags
          .replace(/<br\s*\/?>/gi, '\n')   // <br> tags = newline
          .replace(/<[^>]*>/g, '')         // Remove all other HTML tags
          .replace(/&nbsp;/g, ' ')         // Convert non-breaking spaces
          .replace(/&amp;/g, '&')          // Convert HTML entities
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        
        // Clean up multiple consecutive newlines
        plainText = plainText.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
      }
      
      console.log('📝 Setting plain text content:', plainText);
      setContent(plainText);
      
      // ONLY clear suggestions when switching to a DIFFERENT document
      // NOT when the same document is updated (e.g., during auto-save)
      if (isNewDocument) {
        console.log('📄 NEW DOCUMENT - clearing suggestions');
        setSuggestions([]); // Clear suggestions when switching documents
        setHasGeneratedSuggestions(false); // Reset suggestion state for new document
      } else {
        console.log('📄 SAME DOCUMENT UPDATE - preserving suggestions');
      }
    }
  }, [currentDocument, setContent]);

  const handleCreateNewDocument = async () => {
    if (!user) return;
    
    setIsCreatingDocument(true);
    try {
      const result = await createDocument(user.uid, 'Untitled Document');
      if (result.document) {
        addDocument(result.document);
        setCurrentDocument(result.document);
        setContent('');
      }
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsCreatingDocument(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!editorRef.current || !currentDocument) return;
    
    const content = editorRef.current.innerHTML;
    const newContent = content.slice(0, suggestion.startIndex) +
      suggestion.suggestion +
      content.slice(suggestion.endIndex);
    
    setContent(newContent);
    updateDocument(currentDocument.id, { content: newContent });
    
    // Remove the applied suggestion
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    
    // Add to feedback store
    addFeedback({
      suggestionId: suggestion.id,
      type: suggestion.type,
      accepted: true
    });
  };

  const handleSuggestionReject = (suggestion: Suggestion) => {
    // Remove the rejected suggestion
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    
    // Add to feedback store
    addFeedback({
      suggestionId: suggestion.id,
      type: suggestion.type,
      accepted: false
    });
  };

  const handleGenerateNewSuggestions = () => {
    if (content && content.trim().length > 0) {
      console.log('Manually generating new suggestions - clearing existing ones first');
      // Clear existing suggestions when user explicitly requests new analysis
      setSuggestions([]);
      setHasGeneratedSuggestions(false); // Reset flag to allow new analysis
      analyzeText(content); // Force analysis
    }
  };

  const dismissSuggestion = (suggestionId?: string) => {
    if (suggestionId) {
      // Dismiss specific suggestion
      const updatedSuggestions = suggestions.filter(s => s.id !== suggestionId);
      setSuggestions(updatedSuggestions);
      
      if (selectedSuggestion?.id === suggestionId) {
        setSelectedSuggestion(null);
      }
    } else {
      // Dismiss currently selected suggestion
      setSelectedSuggestion(null);
    }
    setHighlightedSuggestionId(null);
  };

  const handleSuggestionHover = (suggestionId: string | null) => {
    setHighlightedSuggestionId(suggestionId);
  };

  const handleInsertTranscript = (transcript: string) => {
    if (transcript.trim()) {
      // Insert transcript at the end of current content
      const newContent = content + (content ? ' ' : '') + transcript;
      setContent(newContent);
      // Clear suggestions when new content is added - user must manually regenerate
      setSuggestions([]);
      setHasGeneratedSuggestions(false);
    }
    
    setShowVoiceNotes(false);
  };

  const stats = getTextStats(content);
  const errorCount = suggestions.filter(s => s.type === 'spelling' || s.type === 'grammar').length;
  const suggestionCount = suggestions.filter(s => s.type === 'style' || s.type === 'readability').length;

  // Handle plain text content changes - this is user input
  const handlePlainTextChange = (newPlainContent: string) => {
    const now = Date.now();
    const timeSinceLastAutoSave = now - lastAutoSaveTime.current;
    const timeSinceSuggestionApplication = now - suggestionApplicationTime.current;
    
    console.log('🔍 === PLAIN TEXT CHANGE DEBUG ===');
    console.log('📝 Content Details:', {
      newContentLength: newPlainContent.length,
      currentContentLength: content.length,
      newContentPreview: newPlainContent.substring(0, 100) + '...',
      currentContentPreview: content.substring(0, 100) + '...',
      contentChanged: newPlainContent !== content,
      lengthDiff: Math.abs(newPlainContent.length - content.length)
    });
    
    console.log('🏃 State Flags:', {
      isApplyingSuggestion: isApplyingSuggestion,
      isAutoSaving: isAutoSaving,
      isProgrammaticUpdate: isProgrammaticUpdate.current,
      timeSinceLastAutoSave: timeSinceLastAutoSave,
      timeSinceSuggestionApplication: timeSinceSuggestionApplication
    });
    
    console.log('💡 Suggestions State:', {
      currentSuggestionsCount: suggestions.length,
      hasGeneratedSuggestions: hasGeneratedSuggestions,
      suggestionsIds: suggestions.map(s => s.id),
      isLastAppliedContent: newPlainContent === lastAppliedSuggestionContent.current
    });
    
    // Always update the content
    console.log('📝 Updating content state...');
    setContent(newPlainContent);
    
    // NEVER automatically clear suggestions - let the user decide when to regenerate
    // Suggestions will only be cleared when:
    // 1. User clicks "Generate Suggestions" button (handleGenerateNewSuggestions)
    // 2. User switches to a different document
    // 3. User applies a suggestion (which removes that specific suggestion)
    
    console.log('✅ PRESERVING ALL SUGGESTIONS - Never auto-clear, user controls when to regenerate');
    console.log('📊 Suggestions after content update:', suggestions.length);
    
    // Only reset the generated flag if there are no suggestions (for fresh analysis)
    if (suggestions.length === 0 && newPlainContent !== content) {
      console.log('🔄 Resetting hasGeneratedSuggestions flag (no suggestions exist)');
      setHasGeneratedSuggestions(false);
    }
    
    // Update the document store (only if not already updated during suggestion application)
    const isFromSuggestionApplication = 
      newPlainContent === lastAppliedSuggestionContent.current ||
      timeSinceSuggestionApplication < 1000;
      
    console.log('💾 Document Store Update Check:', {
      shouldUpdate: !isApplyingSuggestion && !isFromSuggestionApplication,
      isApplyingSuggestion,
      isFromSuggestionApplication,
      currentDocumentId: currentDocument?.id
    });
      
    if (!isApplyingSuggestion && !isFromSuggestionApplication) {
      const { updateDocument } = useDocumentStore.getState();
      if (currentDocument) {
        console.log('💾 Updating document store...');
        updateDocument(currentDocument.id, { 
          content: newPlainContent,
          updatedAt: new Date()
        });
      }
    }
    
    console.log('🔍 === END PLAIN TEXT CHANGE DEBUG ===\n');
  };

  // Auto-save functionality with enhanced tracking
  const handleAutoSaveStateChange = useCallback((saving: boolean) => {
    console.log('Auto-save state change:', saving);
    setIsAutoSaving(saving);
    
    if (saving) {
      lastAutoSaveTime.current = Date.now();
    } else {
      // Keep the flag set for a bit longer to prevent clearing suggestions
      setTimeout(() => {
        // Only reset if no new auto-save has started
        if (Date.now() - lastAutoSaveTime.current > 500) {
          setIsAutoSaving(false);
        }
      }, 1000);
    }
  }, []);

  const { saveStatus } = useAutoSave(handleAutoSaveStateChange);
  
  // Log save status for debugging (prevents TypeScript unused variable warning)
  useEffect(() => {
    console.log('Auto-save status:', saveStatus);
  }, [saveStatus]);

  // Debug: Track suggestions changes
  useEffect(() => {
    console.log('🔍 === SUGGESTIONS STATE CHANGE ===');
    console.log('💡 New suggestions state:', {
      count: suggestions.length,
      ids: suggestions.map(s => s.id),
      types: suggestions.map(s => s.type),
      hasGeneratedSuggestions: hasGeneratedSuggestions
    });
    
    if (suggestions.length === 0) {
      console.log('❌ ALL SUGGESTIONS CLEARED! Stack trace:');
      console.trace();
    }
    
    console.log('🔍 === END SUGGESTIONS STATE CHANGE ===\n');
  }, [suggestions, hasGeneratedSuggestions]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!currentDocument) return;
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
    updateDocument(currentDocument.id, { content: newContent });
  };

  const handleBlur = () => {
    // Save content on blur
    if (currentDocument && content !== currentDocument.content) {
      updateDocument(currentDocument.id, { content });
    }
  };

  const renderSuggestionsByType = (type: Suggestion['type']) => {
    return suggestions
      .filter(s => s.type === type)
      .map(suggestion => (
        <div
          key={suggestion.id}
          className={`suggestion-item ${suggestion.type}`}
          onClick={() => handleSuggestionClick(suggestion)}
        >
          <div className="suggestion-content">
            <span className="original">{suggestion.originalText}</span>
            <span className="arrow">→</span>
            <span className="suggested">{suggestion.suggestion}</span>
          </div>
          <div className="suggestion-explanation">
            {suggestion.explanation}
          </div>
          <button
            className="reject-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSuggestionReject(suggestion);
            }}
          >
            Reject
          </button>
        </div>
      ));
  };

  // If no document is selected, show the "Create New Document" interface
  if (!currentDocument) {
    return (
      <div className={`flex-1 flex items-center justify-center transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6 border-4 ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <span className="text-4xl">📝</span>
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to start writing?
          </h2>
          
          <p className={`text-lg mb-8 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Create your first document to begin writing with AI-powered assistance.
          </p>
          
          <button
            onClick={handleCreateNewDocument}
            disabled={isCreatingDocument}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isCreatingDocument ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>📄 Create New Document</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>
          
          <div className={`mt-6 text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Or select an existing document from the sidebar
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className={`flex-1 relative ${showAnalysis ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
        <div className={`flex-1 flex transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Editor Header */}
            <div className={`border-b shadow-sm transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* First Row - Main Controls */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <h2 className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>✍️ Document Editor</h2>
                  
                  {/* Writing Settings Display */}
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-indigo-900/50 text-indigo-300' 
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      <span>📚</span>
                      <span>{currentWritingSettings.academicStyle === 'none' ? 'General' : currentWritingSettings.academicStyle.toUpperCase()}</span>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      <span>🌍</span>
                      <span>{currentWritingSettings.languageVariant.toUpperCase()}</span>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      <span>{currentWritingSettings.checkingMode === 'speed' ? '⚡' : currentWritingSettings.checkingMode === 'comprehensive' ? '🔍' : '⚖️'}</span>
                      <span>{currentWritingSettings.checkingMode === 'comprehensive' ? 'Thorough' : currentWritingSettings.checkingMode}</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-2 text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {errorCount > 0 && (
                      <span className={`px-3 py-1 rounded-full font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-red-900/50 text-red-300' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {errorCount} error{errorCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {suggestionCount > 0 && (
                      <span className={`px-3 py-1 rounded-full font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-900/50 text-blue-300' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestionCount} suggestion{suggestionCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {errorCount === 0 && suggestionCount === 0 && content.trim() && (
                      <span className={`px-3 py-1 rounded-full font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-green-900/50 text-green-300' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        ✓ No issues found
                      </span>
                    )}
                    {isAnalyzing && (
                      <span className={`flex items-center px-3 py-1 rounded-full font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-yellow-900/50 text-yellow-300' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <div className={`animate-spin rounded-full h-3 w-3 border-2 border-t-transparent mr-2 ${
                          isDarkMode ? 'border-yellow-300' : 'border-yellow-600'
                        }`}></div>
                        Analyzing...
                      </span>
                    )}
                  </div>
                </div>
                
                {/* AI Suggestions Toggle - Always Visible */}
                <div className="flex items-center space-x-6">
                  {/* AI Suggestions Toggle */}
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm transition-colors ${
                      !suggestionsEnabled 
                        ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Off
                    </span>
                    <button
                      onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
                      } ${
                        suggestionsEnabled ? 'bg-blue-600' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                      title={`Turn AI suggestions ${suggestionsEnabled ? 'off' : 'on'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          suggestionsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm transition-colors ${
                      suggestionsEnabled 
                        ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      🤖 AI Suggestions
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Second Row - Additional Tools */}
              <div className={`px-4 pb-4 border-t transition-colors ${
                isDarkMode ? 'border-gray-600' : 'border-gray-100'
              }`}>
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className={`px-4 py-2 text-sm border rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    📊 Stats
                  </button>
                  
                  <button
                    onClick={() => setShowVoiceNotes(true)}
                    className={`px-4 py-2 text-sm border rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    title="Voice Notes & Speech-to-Text"
                  >
                    🎤 Voice Notes
                  </button>
                  
                  <button
                    onClick={() => setShowPlagiarismCheck(true)}
                    className={`px-4 py-2 text-sm border rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 disabled:hover:bg-transparent disabled:hover:border-gray-600' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:hover:bg-transparent disabled:hover:border-gray-300'
                    }`}
                    title="Check for Plagiarism"
                    disabled={!content.trim()}
                  >
                    🔍 Plagiarism Check
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            {showStats && (
              <div className={`p-6 border-b shadow-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-sm">
                  <div className={`text-center p-3 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                  }`}>
                    <div className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>{stats.words}</div>
                    <div className={`font-medium transition-colors ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}>Words</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                  }`}>
                    <div className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-green-300' : 'text-green-600'
                    }`}>{stats.characters}</div>
                    <div className={`font-medium transition-colors ${
                      isDarkMode ? 'text-green-400' : 'text-green-700'
                    }`}>Characters</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                  }`}>
                    <div className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-600'
                    }`}>{stats.sentences}</div>
                    <div className={`font-medium transition-colors ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-700'
                    }`}>Sentences</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'
                  }`}>
                    <div className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-orange-300' : 'text-orange-600'
                    }`}>{stats.paragraphs}</div>
                    <div className={`font-medium transition-colors ${
                      isDarkMode ? 'text-orange-400' : 'text-orange-700'
                    }`}>Paragraphs</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'
                  }`}>
                    <div className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                    }`}>{stats.avgWordsPerSentence}</div>
                    <div className={`font-medium transition-colors ${
                      isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                    }`}>Avg Words/Sentence</div>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'
                  }`}>
                    <div className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-pink-300' : 'text-pink-600'
                    }`}>{stats.readabilityScore}</div>
                    <div className={`font-medium transition-colors ${
                      isDarkMode ? 'text-pink-400' : 'text-pink-700'
                    }`}>Readability</div>
                  </div>
                </div>
              </div>
            )}

            {/* Editor Container */}
            <div className="flex-1 p-6">
              <div className="relative">
                {/* Plain Text Editor */}
                <div
                  className={`w-full min-h-screen p-6 focus:outline-none text-editor ${
                    isDarkMode ? 'dark' : ''
                  }`}
                  contentEditable={isDocumentEditable ? "true" : "false"}
                  ref={editorRef}
                  onInput={handleInput}
                  onBlur={handleBlur}
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Read-only indicator */}
                {!isDocumentEditable && currentDocument?.isShared && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium transition-colors z-30 ${
                    isDarkMode 
                      ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`}>
                    👁️ Read-only
                  </div>
                )}
              </div>
            </div>

            {/* Suggestion Popup */}
            {selectedSuggestion && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`rounded-xl shadow-2xl p-6 w-96 max-w-90vw transition-colors ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        selectedSuggestion.type === 'spelling' || selectedSuggestion.type === 'grammar' 
                          ? 'bg-red-500' 
                          : selectedSuggestion.type === 'style' 
                          ? 'bg-blue-500' 
                          : 'bg-orange-500'
                      }`} />
                      <span className={`text-lg font-semibold capitalize transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {selectedSuggestion.type} Suggestion
                      </span>
                    </div>
                    <button
                      onClick={() => dismissSuggestion()}
                      className={`text-xl transition-colors ${
                        isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className={`mb-4 leading-relaxed transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {selectedSuggestion.message}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className={`text-xs font-medium mb-1 transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Current text:</div>
                      <div className={`p-3 border-l-4 border-red-400 rounded text-sm transition-colors ${
                        isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                      }`}>
                        "{selectedSuggestion.original}"
                      </div>
                    </div>
                    
                    {selectedSuggestion.suggestion && selectedSuggestion.suggestion !== selectedSuggestion.original && (
                      <div>
                        <div className={`text-xs font-medium mb-1 transition-colors ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Suggested improvement:</div>
                        <div className={`p-3 border-l-4 border-green-400 rounded text-sm transition-colors ${
                          isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                        }`}>
                          "{selectedSuggestion.suggestion}"
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    {selectedSuggestion.suggestion && 
                     selectedSuggestion.suggestion !== selectedSuggestion.original && 
                     !selectedSuggestion.suggestion.toLowerCase().includes('consider') &&
                     !selectedSuggestion.suggestion.toLowerCase().includes('try to') &&
                     !selectedSuggestion.suggestion.toLowerCase().includes('you might') &&
                     !(selectedSuggestion.suggestion.startsWith('[') && selectedSuggestion.suggestion.endsWith(']')) ? (
                      <button
                        onClick={(e) => {
                          console.log('Apply button clicked in modal!', e);
                          handleSuggestionClick(selectedSuggestion);
                        }}
                        disabled={!isDocumentEditable}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDarkMode 
                            ? 'bg-green-600 text-white hover:bg-green-700 disabled:hover:bg-green-600' 
                            : 'bg-grammarly-green text-white hover:bg-green-600 disabled:hover:bg-grammarly-green'
                        }`}
                      >
                        ✅ Apply Suggestion
                      </button>
                    ) : (
                      <div className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium text-center transition-colors ${
                        isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        ℹ️ Advisory Only
                      </div>
                    )}
                    <button
                      onClick={() => dismissSuggestion(selectedSuggestion.id)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedSuggestion.suggestion && selectedSuggestion.suggestion !== selectedSuggestion.original ? 'Ignore' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions Sidebar */}
        <div className={`w-full lg:w-80 border-l-2 flex flex-col shadow-xl transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-300'
        }`}>
          <div className={`p-4 border-b-2 transition-colors ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700/50' 
              : 'border-gray-300 bg-gray-50/50'
          }`}>
            <div className={`p-3 rounded-lg border ${
              isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-white/50'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold flex items-center transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>
                  <span className="text-xl mr-2">🤖</span>
                  AI Writing Assistant
                </h3>
                
                {suggestionsEnabled && content.trim() && (
                  <button
                    onClick={handleGenerateNewSuggestions}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600 border-blue-500' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600 border-blue-400'
                    }`}
                    title="Generate new AI suggestions for current text"
                  >
                    {isAnalyzing ? '⏳ Analyzing...' : '✨ Generate Suggestions'}
                  </button>
                )}
              </div>
              
              {!suggestionsEnabled && (
                <div className={`mt-3 p-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-yellow-900/30 border-yellow-600' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-sm transition-colors ${
                    isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                  }`}>
                    AI suggestions are turned off. Enable them to get real-time writing assistance.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {!suggestionsEnabled ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className={`text-center p-6 rounded-lg border transition-colors ${
                isDarkMode ? 'text-gray-400 border-gray-600 bg-gray-700/30' : 'text-gray-500 border-gray-200 bg-gray-50'
              }`}>
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-sm mb-2">AI suggestions are disabled</p>
                <p className={`text-xs transition-colors ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>Turn on AI suggestions to get smart writing assistance</p>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className={`text-center p-6 rounded-lg border transition-colors ${
                isDarkMode ? 'text-gray-400 border-gray-600 bg-gray-700/30' : 'text-gray-500 border-gray-200 bg-gray-50'
              }`}>
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm mb-2">
                  {content.trim() 
                    ? hasGeneratedSuggestions 
                      ? 'Great writing!' 
                      : isAnalyzing 
                        ? 'Analyzing your text...' 
                        : 'Click "Generate Suggestions" to analyze your text'
                    : 'Start typing to get AI suggestions'
                  }
                </p>
                <p className={`text-xs transition-colors ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {content.trim() 
                    ? hasGeneratedSuggestions 
                      ? 'No improvements needed' 
                      : 'AI will provide writing suggestions and improvements'
                    : 'AI will analyze your text as you write'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96 lg:max-h-none">
              {renderSuggestionsByType('grammar')}
              {renderSuggestionsByType('spelling')}
              {renderSuggestionsByType('style')}
              {renderSuggestionsByType('readability')}
            </div>
          )}
        </div>
      </div>
      
      {/* Voice Notes Modal */}
      {showVoiceNotes && (
        <VoiceNotesPanel
          onInsertTranscript={handleInsertTranscript}
          onClose={() => setShowVoiceNotes(false)}
        />
      )}
      
      {/* Plagiarism Check Modal */}
      {showPlagiarismCheck && (
        <PlagiarismPanel
          text={content}
          onClose={() => setShowPlagiarismCheck(false)}
        />
      )}

      {showAnalysis && (
        <div className="w-80 h-full overflow-hidden">
          <AnalysisPanel />
        </div>
      )}
    </div>
  );
} 
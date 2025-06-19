import { useState, useEffect, useCallback } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useProfileStore } from '../store/useProfileStore';
import { applySuggestion, getTextStats } from '../utils/grammarChecker';
import { checkTextWithAI } from '../utils/aiGrammarChecker';
import type { GrammarSuggestion } from '../store/useDocumentStore';
import type { WritingSettings } from '../types';
import { defaultWritingSettings } from '../store/useProfileStore';
import { VoiceNotesPanel } from './VoiceNotesPanel';
import { PlagiarismPanel } from './PlagiarismPanel';
import { DarkModeToggle } from './DarkModeToggle';
import { PlainTextEditor } from './PlainTextEditor';
import { useDarkModeStore } from '../store/useDarkModeStore';

export function TextEditor() {
  const { content, setContent, suggestions, setSuggestions, currentDocument } = useDocumentStore();
  const { profile } = useProfileStore();
  const { isDarkMode } = useDarkModeStore();
  const [selectedSuggestion, setSelectedSuggestion] = useState<GrammarSuggestion | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [highlightedSuggestionId, setHighlightedSuggestionId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  const [currentWritingSettings, setCurrentWritingSettings] = useState<WritingSettings>(defaultWritingSettings);
  const [showVoiceNotes, setShowVoiceNotes] = useState(false);
  const [showPlagiarismCheck, setShowPlagiarismCheck] = useState(false);

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

  // Debounced analysis function - AI only with writing settings
  const analyzeText = useCallback(
    debounce(async (text: string) => {
      if (!text || text.trim().length === 0 || !suggestionsEnabled) {
        setSuggestions([]);
        return;
      }

      setIsAnalyzing(true);
      console.log('Starting AI text analysis with settings:', currentWritingSettings);

      try {
        const newSuggestions = await checkTextWithAI(text, currentWritingSettings);
        console.log('AI analysis complete:', newSuggestions.length, 'suggestions');
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error analyzing text:', error);
        setSuggestions([]);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000),
    [setSuggestions, suggestionsEnabled, currentWritingSettings]
  );

  // Update suggestions when content, document, or settings change
  useEffect(() => {
    if (content) {
      analyzeText(content);
    } else {
      setSuggestions([]);
    }
  }, [content, analyzeText, currentDocument?.id, currentWritingSettings]);

  // Update content when currentDocument changes
  useEffect(() => {
    if (currentDocument) {
      console.log('Loading document:', {
        id: currentDocument.id,
        title: currentDocument.title,
        contentPreview: currentDocument.content.substring(0, 100),
        contentLength: currentDocument.content.length
      });
      
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
      
      console.log('Setting plain text content:', plainText);
      setContent(plainText);
    }
  }, [currentDocument, setContent]);

  const handleSuggestionClick = (suggestion: GrammarSuggestion) => {
    setSelectedSuggestion(suggestion);
    setHighlightedSuggestionId(suggestion.id);
  };

  const applySuggestionClick = (suggestion: GrammarSuggestion) => {
    console.log('=== APPLY SUGGESTION CLICKED ===');
    console.log('Suggestion:', suggestion);
    console.log('Current content before applying:', content);
    console.log('isDocumentEditable:', isDocumentEditable);
    console.log('Document:', document);
    
    // Check if document is editable
    if (!isDocumentEditable) {
      console.error('Document is not editable, cannot apply suggestion');
      return;
    }
    
    // Apply the suggestion to the content
    const newContent = applySuggestion(content, suggestion);
    console.log('New content after applying:', newContent);
    console.log('Content changed:', newContent !== content);
    
    if (newContent !== content) {
      console.log('Updating content and state...');
      
      // Update the content
      setContent(newContent);
      
      // Remove the applied suggestion from the list
      const updatedSuggestions = suggestions.filter(s => s.id !== suggestion.id);
      setSuggestions(updatedSuggestions);
      console.log('Updated suggestions count:', updatedSuggestions.length);
      
      // Clear the selected suggestion
      setSelectedSuggestion(null);
      setHighlightedSuggestionId(null);
      
      console.log('Successfully applied suggestion and updated state');
    } else {
      console.warn('Suggestion did not change the content');
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
    }
    
    setShowVoiceNotes(false);
  };

  const stats = getTextStats(content);
  const errorCount = suggestions.filter(s => s.type === 'spelling' || s.type === 'grammar').length;
  const suggestionCount = suggestions.filter(s => s.type === 'style' || s.type === 'readability').length;

  // Handle plain text content changes
  const handlePlainTextChange = (newPlainContent: string) => {
    console.log('Plain text change:', {
      newContent: newPlainContent,
      contentLines: newPlainContent.split('\n').length
    });
    
    // Update the plain text content for AI analysis
    setContent(newPlainContent);
    
    // Update the document store with plain text content
    const { updateDocument } = useDocumentStore.getState();
    if (currentDocument) {
      updateDocument(currentDocument.id, { 
        content: newPlainContent, // Save plain text content
        updatedAt: new Date()
      });
    }
  };

  return (
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
            
            {/* AI Suggestions Toggle & Dark Mode - Always Visible */}
            <div className="flex items-center space-x-6">
              {/* Dark Mode Toggle */}
              <DarkModeToggle size="sm" />
              
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
            <PlainTextEditor
              content={content}
              onChange={handlePlainTextChange}
              placeholder={!isDocumentEditable ? "This document is read-only" : "Start typing here..."}
              disabled={!isDocumentEditable}
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
              highlightedSuggestionId={highlightedSuggestionId}
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
                <button
                  onClick={(e) => {
                    console.log('Apply button clicked in modal!', e);
                    applySuggestionClick(selectedSuggestion);
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

      {/* Suggestions Sidebar */}
      {(suggestions.length > 0 || !suggestionsEnabled) && (
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
              <h3 className={`text-lg font-semibold flex items-center transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}>
                <span className="text-xl mr-2">🤖</span>
                AI Writing Assistant
              </h3>
              <p className={`text-sm mt-1 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {!suggestionsEnabled ? (
                  <span className={`transition-colors ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>AI suggestions are turned off</span>
                ) : isAnalyzing ? (
                  <span className="flex items-center">
                    <div className={`animate-spin rounded-full h-3 w-3 border-2 border-t-transparent mr-2 ${
                      isDarkMode ? 'border-blue-400' : 'border-blue-600'
                    }`}></div>
                    Analyzing text...
                  </span>
                ) : (
                  `${suggestions.length} suggestion${suggestions.length !== 1 ? 's' : ''} found`
                )}
              </p>
            </div>
            {suggestionsEnabled && (
              <div className={`mt-2 text-xs p-2 rounded border transition-colors ${
                isDarkMode 
                  ? 'text-blue-300 bg-blue-900/30 border-blue-600' 
                  : 'text-blue-600 bg-blue-50 border-blue-200'
              }`}>
                💡 Powered by OpenAI for intelligent writing assistance
              </div>
            )}
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
                <p className="text-sm mb-2">{content.trim() ? 'Great writing!' : 'Start typing to get AI suggestions'}</p>
                <p className={`text-xs transition-colors ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>{content.trim() ? 'No improvements needed' : 'AI will analyze your text as you write'}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96 lg:max-h-none">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 shadow-md ${
                    highlightedSuggestionId === suggestion.id 
                      ? isDarkMode 
                        ? 'border-blue-400 bg-blue-900/30 shadow-lg' 
                        : 'border-blue-400 bg-blue-50 shadow-lg'
                      : isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 bg-gray-700/30' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-white/50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => handleSuggestionHover(suggestion.id)}
                  onMouseLeave={() => handleSuggestionHover(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full border ${
                        suggestion.type === 'spelling' || suggestion.type === 'grammar' 
                          ? 'bg-red-500 border-red-400' 
                          : suggestion.type === 'style' 
                          ? 'bg-blue-500 border-blue-400' 
                          : 'bg-orange-500 border-orange-400'
                      }`} />
                      <span className={`text-xs font-semibold uppercase tracking-wide transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {suggestion.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        suggestion.severity === 'high' 
                          ? isDarkMode ? 'bg-red-900/50 text-red-300 border-red-600' : 'bg-red-100 text-red-700 border-red-200'
                          : suggestion.severity === 'medium'
                          ? isDarkMode ? 'bg-orange-900/50 text-orange-300 border-orange-600' : 'bg-orange-100 text-orange-700 border-orange-200'
                          : isDarkMode ? 'bg-blue-900/50 text-blue-300 border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {suggestion.severity}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissSuggestion(suggestion.id);
                      }}
                      className={`p-1 rounded border transition-colors ${
                        isDarkMode ? 'text-gray-400 hover:text-red-400 border-gray-600 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 border-gray-300 hover:bg-red-50'
                      }`}
                      title="Dismiss suggestion"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className={`p-2 rounded border mb-2 transition-colors ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {suggestion.message}
                    </p>
                  </div>
                  
                  <div className={`text-xs p-2 rounded border transition-colors ${
                    isDarkMode ? 'text-gray-400 bg-gray-800/50 border-gray-600' : 'text-gray-500 bg-white border-gray-200'
                  }`}>
                    <span className="font-medium">Text:</span> "{suggestion.original}"
                    {suggestion.suggestion && suggestion.suggestion !== suggestion.original && (
                      <>
                        <br />
                        <span className="font-medium">AI Suggestion:</span> "{suggestion.suggestion}"
                      </>
                    )}
                  </div>
                  
                  {suggestion.suggestion && suggestion.suggestion !== suggestion.original && (
                    <button
                      onClick={(e) => {
                        console.log('Apply button clicked in sidebar!', e, suggestion);
                        e.stopPropagation();
                        applySuggestionClick(suggestion);
                      }}
                      disabled={!isDocumentEditable}
                      className={`mt-3 w-full py-2 px-3 rounded border text-xs font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600 border-blue-500' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600 border-blue-400'
                      }`}
                    >
                      ✨ Apply AI Suggestion
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
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
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 
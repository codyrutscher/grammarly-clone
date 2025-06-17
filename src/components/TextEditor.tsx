import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useProfileStore } from '../store/useProfileStore';
import { applySuggestion, getTextStats } from '../utils/grammarChecker';
import { checkTextWithAI } from '../utils/aiGrammarChecker';
import type { GrammarSuggestion } from '../store/useDocumentStore';
import type { WritingSettings } from '../types';
import { defaultWritingSettings } from '../store/useProfileStore';
import { VoiceNotesPanel } from './VoiceNotesPanel';
import { PlagiarismPanel } from './PlagiarismPanel';

export function TextEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const { content, setContent, suggestions, setSuggestions, currentDocument } = useDocumentStore();
  const { profile } = useProfileStore();
  const [selectedSuggestion, setSelectedSuggestion] = useState<GrammarSuggestion | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [highlightedSuggestionId, setHighlightedSuggestionId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  const [currentWritingSettings, setCurrentWritingSettings] = useState<WritingSettings>(defaultWritingSettings);
  const [showVoiceNotes, setShowVoiceNotes] = useState(false);
  const [showPlagiarismCheck, setShowPlagiarismCheck] = useState(false);

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
      setContent(currentDocument.content);
      // Sync with contentEditable div
      if (editorRef.current && editorRef.current.innerHTML !== currentDocument.content.replace(/\n/g, '<br>')) {
        editorRef.current.innerHTML = currentDocument.content.replace(/\n/g, '<br>');
      }
    }
  }, [currentDocument, setContent]);

  // Track if content is being updated programmatically
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);
  
  // Sync contentEditable when content changes from store (but not from user input)
  useEffect(() => {
    if (isUpdatingContent && editorRef.current && editorRef.current.innerText !== content) {
      editorRef.current.innerHTML = content.replace(/\n/g, '<br>');
      setIsUpdatingContent(false);
    }
  }, [content, isUpdatingContent]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText || '';
    if (newContent !== content) {
      setContent(newContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter key for proper paragraph breaks
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Insert line break
        const br = document.createElement('br');
        range.insertNode(br);
        
        // Move cursor after the break
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content
        if (editorRef.current) {
          const newContent = editorRef.current.innerText || '';
          setContent(newContent);
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData?.getData('text') || '';
    
    // Insert at current cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Create text node and insert
      const textNode = document.createTextNode(pasteData);
      range.insertNode(textNode);
      
      // Move cursor to end of pasted text
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Update content from the DOM
      if (editorRef.current) {
        const newContent = editorRef.current.innerText || '';
        setContent(newContent);
      }
    } else {
      // Fallback
      const newContent = content + pasteData;
      setContent(newContent);
      setIsUpdatingContent(true);
    }
  };

  const handleSuggestionClick = (suggestion: GrammarSuggestion) => {
    setSelectedSuggestion(suggestion);
    setHighlightedSuggestionId(suggestion.id);
  };

  const applySuggestionClick = (suggestion: GrammarSuggestion) => {
    console.log('Applying suggestion:', suggestion);
    
    // Apply the suggestion to the content
    const newContent = applySuggestion(content, suggestion);
    console.log('New content:', newContent);
    
    // Update the content
    setContent(newContent);
    
    // Remove the applied suggestion from the list
    const updatedSuggestions = suggestions.filter(s => s.id !== suggestion.id);
    setSuggestions(updatedSuggestions);
    
    // Clear the selected suggestion
    setSelectedSuggestion(null);
    setHighlightedSuggestionId(null);
    
    // Focus back on textarea
    if (editorRef.current) {
      editorRef.current.focus();
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
    if (editorRef.current) {
      // Insert text at current cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create text node and insert
        const textNode = document.createTextNode((content ? ' ' : '') + transcript);
        range.insertNode(textNode);
        
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content from the DOM
        const newContent = editorRef.current.innerText || '';
        setContent(newContent);
      } else {
        // Fallback: append to end
        const newContent = content + (content ? ' ' : '') + transcript;
        setContent(newContent);
        setIsUpdatingContent(true);
        
        // Focus and move cursor to end
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 0);
      }
    }
    
    setShowVoiceNotes(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const suggestionId = target.getAttribute('data-suggestion-id');
    
    if (suggestionId) {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        handleSuggestionClick(suggestion);
      }
    }
  };

  const renderHighlightedText = () => {
    if (!content) return '';
    
    let result = content;
    const sortedSuggestions = [...suggestions].sort((a, b) => b.start - a.start);
    
    sortedSuggestions.forEach((suggestion) => {
      const before = result.substring(0, suggestion.start);
      const highlighted = result.substring(suggestion.start, suggestion.end);
      const after = result.substring(suggestion.end);
      
      // Only background colors, no text styling
      const colorClass = {
        grammar: 'bg-red-100',
        spelling: 'bg-red-100', 
        style: 'bg-blue-100',
        readability: 'bg-orange-100'
      }[suggestion.type];
      
      const isHovered = highlightedSuggestionId === suggestion.id;
      const hoverClass = isHovered ? 'bg-yellow-200' : '';
      
      result = before + 
        `<span class="${colorClass} ${hoverClass} rounded-sm" data-suggestion-id="${suggestion.id}">${highlighted}</span>` + 
        after;
    });
    
    return result.replace(/\n/g, '<br>');
  };

  const renderClickableText = () => {
    if (!content) return '';
    
    let result = content;
    const sortedSuggestions = [...suggestions].sort((a, b) => b.start - a.start);
    
    sortedSuggestions.forEach((suggestion) => {
      const before = result.substring(0, suggestion.start);
      const highlighted = result.substring(suggestion.start, suggestion.end);
      const after = result.substring(suggestion.end);
      
      result = before + 
        `<span class="cursor-pointer" data-suggestion-id="${suggestion.id}">${highlighted}</span>` + 
        after;
    });
    
    return result.replace(/\n/g, '<br>');
  };

  const stats = getTextStats(content);
  const errorCount = suggestions.filter(s => s.type === 'spelling' || s.type === 'grammar').length;
  const suggestionCount = suggestions.filter(s => s.type === 'style' || s.type === 'readability').length;

  return (
    <div className="flex-1 flex bg-gray-50">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          {/* First Row - Main Controls */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800">✍️ Document Editor</h2>
              
              {/* Writing Settings Display */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                  <span>📚</span>
                  <span>{currentWritingSettings.academicStyle === 'none' ? 'General' : currentWritingSettings.academicStyle.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                  <span>🌍</span>
                  <span>{currentWritingSettings.languageVariant.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-md">
                  <span>{currentWritingSettings.checkingMode === 'speed' ? '⚡' : currentWritingSettings.checkingMode === 'comprehensive' ? '🔍' : '⚖️'}</span>
                  <span>{currentWritingSettings.checkingMode === 'comprehensive' ? 'Thorough' : currentWritingSettings.checkingMode}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {errorCount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                    {errorCount} error{errorCount !== 1 ? 's' : ''}
                  </span>
                )}
                {suggestionCount > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {suggestionCount} suggestion{suggestionCount !== 1 ? 's' : ''}
                  </span>
                )}
                {errorCount === 0 && suggestionCount === 0 && content.trim() && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    ✓ No issues found
                  </span>
                )}
                {isAnalyzing && (
                  <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-600 border-t-transparent mr-2"></div>
                    Analyzing...
                  </span>
                )}
              </div>
            </div>
            
            {/* AI Suggestions Toggle - Always Visible */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${!suggestionsEnabled ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Off
              </span>
              <button
                onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  suggestionsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                title={`Turn AI suggestions ${suggestionsEnabled ? 'off' : 'on'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    suggestionsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${suggestionsEnabled ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                🤖 AI Suggestions
              </span>
            </div>
          </div>
          
          {/* Second Row - Additional Tools */}
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                📊 Stats
              </button>
              
              <button
                onClick={() => setShowVoiceNotes(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                title="Voice Notes & Speech-to-Text"
              >
                🎤 Voice Notes
              </button>
              
              <button
                onClick={() => setShowPlagiarismCheck(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
          <div className="p-6 bg-white border-b border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.words}</div>
                <div className="text-blue-700 font-medium">Words</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.characters}</div>
                <div className="text-green-700 font-medium">Characters</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.sentences}</div>
                <div className="text-purple-700 font-medium">Sentences</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.paragraphs}</div>
                <div className="text-orange-700 font-medium">Paragraphs</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.avgWordsPerSentence}</div>
                <div className="text-indigo-700 font-medium">Avg Words/Sentence</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{stats.readabilityScore}</div>
                <div className="text-pink-700 font-medium">Readability</div>
              </div>
            </div>
          </div>
        )}

        {/* Editor Container */}
        <div className="flex-1 p-6">
          <div className="relative w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Suggestion highlights background layer */}
            {suggestions.length > 0 && (
              <div
                className="absolute inset-0 p-8 pointer-events-none whitespace-pre-wrap overflow-hidden z-5"
                style={{ 
                  lineHeight: '1.7',
                  fontSize: '16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  color: 'transparent'
                }}
                dangerouslySetInnerHTML={{ __html: renderHighlightedText() }}
              />
            )}

            {/* Main text area - always visible */}
            <div
              ref={editorRef}
              className="w-full h-full p-8 bg-transparent resize-none outline-none text-gray-900 leading-relaxed relative z-10"
              style={{ 
                lineHeight: '1.7',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              data-placeholder={!content ? "Start typing here..." : ""}
            />

            {/* Invisible click layer for suggestion interaction */}
            {suggestions.length > 0 && (
              <div
                className="absolute inset-0 p-8 pointer-events-auto whitespace-pre-wrap overflow-hidden z-15"
                style={{ 
                  lineHeight: '1.7',
                  fontSize: '16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  color: 'transparent',
                  background: 'transparent'
                }}
                onClick={handleOverlayClick}
                dangerouslySetInnerHTML={{ __html: renderClickableText() }}
              />
            )}

            {/* Placeholder styling */}
            <style>{`
              [data-placeholder]:empty:before {
                content: attr(data-placeholder);
                color: #9ca3af;
                pointer-events: none;
              }
            `}</style>
          </div>
        </div>

        {/* Suggestion Popup */}
        {selectedSuggestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-90vw">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    selectedSuggestion.type === 'spelling' || selectedSuggestion.type === 'grammar' 
                      ? 'bg-red-500' 
                      : selectedSuggestion.type === 'style' 
                      ? 'bg-blue-500' 
                      : 'bg-orange-500'
                  }`} />
                  <span className="text-lg font-semibold capitalize text-gray-800">
                    {selectedSuggestion.type} Suggestion
                  </span>
                </div>
                <button
                  onClick={() => dismissSuggestion()}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                {selectedSuggestion.message}
              </p>
              
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Current text:</div>
                  <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded text-sm">
                    "{selectedSuggestion.original}"
                  </div>
                </div>
                
                {selectedSuggestion.suggestion && selectedSuggestion.suggestion !== selectedSuggestion.original && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Suggested improvement:</div>
                    <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded text-sm">
                      "{selectedSuggestion.suggestion}"
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => applySuggestionClick(selectedSuggestion)}
                  className="flex-1 bg-grammarly-green text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  ✅ Apply Suggestion
                </button>
                <button
                  onClick={() => dismissSuggestion(selectedSuggestion.id)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <span className="text-xl mr-2">🤖</span>
              AI Writing Assistant
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {!suggestionsEnabled ? (
                <span className="text-orange-600">AI suggestions are turned off</span>
              ) : isAnalyzing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent mr-2"></div>
                  Analyzing text...
                </span>
              ) : (
                `${suggestions.length} suggestion${suggestions.length !== 1 ? 's' : ''} found`
              )}
            </p>
            {suggestionsEnabled && (
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 Powered by OpenAI for intelligent writing assistance
              </div>
            )}
          </div>
          
          {!suggestionsEnabled ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-sm mb-2">AI suggestions are disabled</p>
                <p className="text-xs text-gray-400">Turn on AI suggestions to get smart writing assistance</p>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm mb-2">{content.trim() ? 'Great writing!' : 'Start typing to get AI suggestions'}</p>
                <p className="text-xs text-gray-400">{content.trim() ? 'No improvements needed' : 'AI will analyze your text as you write'}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    highlightedSuggestionId === suggestion.id 
                      ? 'border-blue-400 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => handleSuggestionHover(suggestion.id)}
                  onMouseLeave={() => handleSuggestionHover(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        suggestion.type === 'spelling' || suggestion.type === 'grammar' 
                          ? 'bg-red-500' 
                          : suggestion.type === 'style' 
                          ? 'bg-blue-500' 
                          : 'bg-orange-500'
                      }`} />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        {suggestion.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        suggestion.severity === 'high' 
                          ? 'bg-red-100 text-red-700'
                          : suggestion.severity === 'medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.severity}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissSuggestion(suggestion.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Dismiss suggestion"
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {suggestion.message}
                  </p>
                  
                  <div className="text-xs text-gray-500">
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
                        e.stopPropagation();
                        applySuggestionClick(suggestion);
                      }}
                      className="mt-3 w-full bg-blue-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
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
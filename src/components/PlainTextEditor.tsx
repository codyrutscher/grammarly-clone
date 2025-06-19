import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDarkModeStore } from '../store/useDarkModeStore';
import { exportDocumentAsPDF } from '../utils/exportUtils';
import type { GrammarSuggestion } from '../store/useDocumentStore';

interface PlainTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  suggestions?: GrammarSuggestion[];
  onSuggestionClick?: (suggestion: GrammarSuggestion) => void;
  highlightedSuggestionId?: string | null;
}

export function PlainTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  disabled, 
  suggestions = [],
  onSuggestionClick,
  highlightedSuggestionId
}: PlainTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isDarkMode } = useDarkModeStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Update textarea content when prop changes
  useEffect(() => {
    if (textareaRef.current && content !== textareaRef.current.value && !isUpdating) {
      setIsUpdating(true);
      // Convert HTML content back to plain text if needed
      const plainText = content
        .replace(/<\/p>/gi, '\n')        // End of paragraph = newline
        .replace(/<p[^>]*>/gi, '')       // Remove opening p tags
        .replace(/<br\s*\/?>/gi, '\n')   // <br> tags = newline
        .replace(/<[^>]*>/g, '')         // Remove all HTML tags
        .replace(/&nbsp;/g, ' ')         // Convert non-breaking spaces
        .replace(/&amp;/g, '&')          // Convert HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      
      textareaRef.current.value = plainText;
      setIsUpdating(false);
    }
  }, [content, isUpdating]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isUpdating) {
      const newContent = e.target.value;
      onChange(newContent);
    }
  }, [onChange, isUpdating]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab character
      const newValue = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      
      onChange(newValue);
    }
  }, [disabled, onChange]);

  const exportToText = useCallback(() => {
    if (!textareaRef.current) return;
    
    const content = textareaRef.current.value;
    const exportContent = `${content}\n\n---\nExported from StudyWrite on ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportToWord = useCallback(() => {
    if (!textareaRef.current) return;
    
    const content = textareaRef.current.value;
    // Convert line breaks to paragraphs for Word
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>StudyWrite Document</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          p { margin: 12px 0; }
        </style>
      </head>
      <body>
        ${content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}
        <hr>
        <p><small>Exported from StudyWrite on ${new Date().toLocaleDateString()}</small></p>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.doc';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportToPDF = useCallback(() => {
    if (!textareaRef.current) return;
    
    const title = 'StudyWrite Document';
    const content = textareaRef.current.value;
    exportDocumentAsPDF(title, content);
  }, []);

  const exportToGoogleDocs = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textContent = textareaRef.current.value;
    const encodedContent = encodeURIComponent(textContent);
    
    alert('Opening Google Docs. The document content will be ready to paste.');
    
    const googleDocsUrl = `https://docs.google.com/document/create?title=StudyWrite%20Document&body=${encodedContent}`;
    window.open(googleDocsUrl, '_blank');
  }, []);

  const importFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.type === 'text/plain') {
        onChange(content);
      } else if (file.type === 'text/html') {
        // Convert HTML to plain text
        const plainText = content
          .replace(/<\/p>/gi, '\n')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        onChange(plainText);
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  }, [onChange]);

  // Calculate word count and other stats
  const getStats = useCallback(() => {
    if (!textareaRef.current) return { words: 0, characters: 0, lines: 0 };
    
    const text = textareaRef.current.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const lines = text.split('\n').length;
    
    return { words, characters, lines };
  }, []);

  const stats = getStats();

  // Highlight suggestions in the content for display
  const highlightSuggestions = useCallback((text: string) => {
    if (!suggestions.length) return text;
    
    let result = text;
    const sortedSuggestions = [...suggestions].sort((a, b) => b.start - a.start);
    
    sortedSuggestions.forEach((suggestion) => {
      const before = result.substring(0, suggestion.start);
      const highlighted = result.substring(suggestion.start, suggestion.end);
      const after = result.substring(suggestion.end);
      
      const colorClass = {
        grammar: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
        spelling: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
        style: isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
        readability: isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800'
      }[suggestion.type];
      
      const isHighlighted = highlightedSuggestionId === suggestion.id;
      const highlightClass = isHighlighted ? (isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-200') : '';
      
      result = before + 
        `<span class="${colorClass} ${highlightClass} rounded px-1 cursor-pointer underline decoration-wavy" data-suggestion-id="${suggestion.id}">${highlighted}</span>` + 
        after;
    });
    
    return result.replace(/\n/g, '<br>');
  }, [suggestions, highlightedSuggestionId, isDarkMode]);

  return (
    <div className={`border-2 rounded-lg shadow-inner relative z-20 ${
      isDarkMode 
        ? 'border-gray-600 bg-gray-800/30' 
        : 'border-gray-200 bg-white'
    }`}>
      {/* Simple Toolbar */}
      {!disabled && (
        <div className={`flex items-center justify-between gap-2 p-3 border-b-2 flex-wrap ${
          isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {stats.words} words
            </span>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {stats.characters} characters
            </span>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {stats.lines} lines
            </span>
            {suggestions.length > 0 && (
              <span className={`px-2 py-1 rounded text-xs ${
                isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Export/Import buttons */}
          <div className="flex items-center gap-2">
            <label className={`px-3 py-1 text-xs rounded cursor-pointer transition-colors ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}>
              📁 Import
              <input
                type="file"
                accept=".txt,.html"
                onChange={importFile}
                className="hidden"
              />
            </label>
            
            <div className="relative group">
              <button className={`px-3 py-1 text-xs rounded transition-colors ${
                isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}>
                💾 Export
              </button>
              <div className={`absolute top-full right-0 mt-1 w-40 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              } border`}>
                <button
                  onClick={exportToText}
                  className={`w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📝 Text (.txt)
                </button>
                <button
                  onClick={exportToWord}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📄 Word (.doc)
                </button>
                <button
                  onClick={exportToPDF}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📑 PDF
                </button>
                <button
                  onClick={exportToGoogleDocs}
                  className={`w-full text-left px-3 py-2 text-sm rounded-b-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📊 Google Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div className="relative">
        {/* Plain Text Editor */}
        <textarea
          ref={textareaRef}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Start typing here..."}
          className={`w-full min-h-96 p-6 outline-none resize-none transition-colors ${
            isDarkMode ? 'text-gray-100 bg-transparent' : 'text-gray-900 bg-transparent'
          } ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-text'}`}
          style={{ 
            lineHeight: '1.7',
            fontSize: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
        />
        
        {/* Placeholder when empty */}
        {!content && !disabled && (
          <div className={`absolute top-6 left-6 pointer-events-none transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {placeholder || "Start typing here..."}
          </div>
        )}
      </div>

      {/* Suggestions Preview */}
      {suggestions.length > 0 && (
        <div className={`border-t-2 p-4 max-h-48 overflow-y-auto ${
          isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            🔍 Text with AI Suggestions Highlighted:
          </div>
          <div
            className={`text-sm leading-relaxed p-3 rounded border ${
              isDarkMode ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
            }`}
            dangerouslySetInnerHTML={{ __html: highlightSuggestions(content) }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const suggestionId = target.getAttribute('data-suggestion-id');
              if (suggestionId && onSuggestionClick) {
                const suggestion = suggestions.find(s => s.id === suggestionId);
                if (suggestion) {
                  onSuggestionClick(suggestion);
                }
              }
            }}
          />
          <div className={`text-xs mt-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            💡 Click on highlighted text to see suggestions, or use the sidebar to review all suggestions.
          </div>
        </div>
      )}
    </div>
  );
} 
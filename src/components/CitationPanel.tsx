import { useState } from 'react';
import { useDarkModeStore } from '../store/useDarkModeStore';

interface CitationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CitationData {
  title: string;
  authors: string[];
  publication: string;
  publicationDate: string;
  url?: string;
  doi?: string;
  pages?: string;
  volume?: string;
  issue?: string;
  publisher?: string;
  accessDate?: string;
}

export function CitationPanel({ isOpen, onClose }: CitationPanelProps) {
  const { isDarkMode } = useDarkModeStore();
  const [citationData, setCitationData] = useState<CitationData | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CitationData>({
    title: '',
    authors: [''],
    publication: '',
    publicationDate: '',
    url: '',
    doi: '',
    pages: '',
    volume: '',
    issue: '',
    publisher: '',
    accessDate: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleManualSubmit = () => {
    if (!formData.title || !formData.authors[0] || !formData.publication) {
      setError('Please fill in at least the title, author, and publication fields.');
      return;
    }
    setCitationData(formData);
  };

  const updateFormField = (field: keyof CitationData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAuthor = () => {
    setFormData(prev => ({ ...prev, authors: [...prev.authors, ''] }));
  };

  const updateAuthor = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => i === index ? value : author)
    }));
  };

  const removeAuthor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const generateCitation = (data: CitationData, format: string): string => {
    const authors = data.authors.filter(a => a.trim()).join(', ');
    const year = data.publicationDate;
    
    switch (format) {
      case 'apa':
        return `${authors} (${year}). ${data.title}. ${data.publication}${data.volume ? `, ${data.volume}` : ''}${data.issue ? `(${data.issue})` : ''}${data.pages ? `, ${data.pages}` : ''}. ${data.doi ? `https://doi.org/${data.doi}` : data.url || ''}`;
      
      case 'mla':
        return `${authors} "${data.title}." ${data.publication}${data.volume ? `, vol. ${data.volume}` : ''}${data.issue ? `, no. ${data.issue}` : ''}, ${year}${data.pages ? `, pp. ${data.pages}` : ''}. Web. ${data.accessDate}.`;
      
      case 'chicago':
        return `${authors} "${data.title}." ${data.publication}${data.volume ? ` ${data.volume}` : ''}${data.issue ? `, no. ${data.issue}` : ''} (${year})${data.pages ? `: ${data.pages}` : ''}. Accessed ${data.accessDate}. ${data.url}.`;
      
      case 'harvard':
        return `${authors} ${year}, '${data.title}', ${data.publication}${data.volume ? `, vol. ${data.volume}` : ''}${data.issue ? `, no. ${data.issue}` : ''}${data.pages ? `, pp. ${data.pages}` : ''}, viewed ${data.accessDate}, <${data.url}>.`;
      
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`sticky top-0 flex justify-between items-center p-6 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📚 Manual Citation Generator
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

        <div className="p-6">
          {!citationData ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create Professional Citations
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enter your source information to generate properly formatted citations in academic styles
                </p>
              </div>

              {/* Manual Entry Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormField('title', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Article or book title"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Publication *
                    </label>
                    <input
                      type="text"
                      value={formData.publication}
                      onChange={(e) => updateFormField('publication', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Journal, website, or publication name"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Authors *
                  </label>
                  {formData.authors.map((author, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => updateAuthor(index, e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Last, F. M."
                      />
                      {formData.authors.length > 1 && (
                        <button
                          onClick={() => removeAuthor(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addAuthor}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Author
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Publication Date
                    </label>
                    <input
                      type="text"
                      value={formData.publicationDate}
                      onChange={(e) => updateFormField('publicationDate', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="2024"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Volume
                    </label>
                    <input
                      type="text"
                      value={formData.volume}
                      onChange={(e) => updateFormField('volume', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="15"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Issue
                    </label>
                    <input
                      type="text"
                      value={formData.issue}
                      onChange={(e) => updateFormField('issue', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="3"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Pages
                    </label>
                    <input
                      type="text"
                      value={formData.pages}
                      onChange={(e) => updateFormField('pages', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="123-145"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      DOI
                    </label>
                    <input
                      type="text"
                      value={formData.doi}
                      onChange={(e) => updateFormField('doi', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="10.1000/example.doi"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => updateFormField('url', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="https://example.com/article"
                  />
                </div>

                <button
                  onClick={handleManualSubmit}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Generate Citation
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* Citation Results */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Generated Citation
                </h3>
                <button
                  onClick={() => {
                    setCitationData(null);
                    setError('');
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← New Citation
                </button>
              </div>

              {/* Citation Format Selector */}
              <div className="flex space-x-2 flex-wrap">
                {(['apa', 'mla', 'chicago', 'harvard'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedFormat === format
                        ? 'bg-blue-600 text-white'
                        : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Citation Display */}
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`font-mono text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {generateCitation(citationData, selectedFormat)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    const citation = generateCitation(citationData, selectedFormat);
                    await navigator.clipboard.writeText(citation);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📋 Copy Citation
                </button>
                <button
                  onClick={() => {
                    const citation = generateCitation(citationData, selectedFormat);
                    const blob = new Blob([citation], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `citation-${selectedFormat}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                    isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  💾 Download
                </button>
              </div>

              {/* Source Information */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-blue-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Source Information
                </h4>
                <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p><strong>Title:</strong> {citationData.title}</p>
                  <p><strong>Authors:</strong> {citationData.authors.join(', ')}</p>
                  <p><strong>Publication:</strong> {citationData.publication}</p>
                  <p><strong>Year:</strong> {citationData.publicationDate}</p>
                  {citationData.doi && <p><strong>DOI:</strong> {citationData.doi}</p>}
                  {citationData.url && <p><strong>URL:</strong> <a href={citationData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{citationData.url}</a></p>}
                  <p><strong>Access Date:</strong> {citationData.accessDate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
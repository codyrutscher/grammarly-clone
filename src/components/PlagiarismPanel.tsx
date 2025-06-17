import React, { useState, useEffect } from 'react';
import type { PlagiarismResult, PlagiarismMatch } from '../types';

interface PlagiarismPanelProps {
  text: string;
  onClose: () => void;
}

export const PlagiarismPanel: React.FC<PlagiarismPanelProps> = ({
  text,
  onClose
}) => {
  const [result, setResult] = useState<PlagiarismResult>({
    overallScore: 0,
    matches: [],
    sources: [],
    isChecking: false
  });

  const [selectedMatch, setSelectedMatch] = useState<PlagiarismMatch | null>(null);

  useEffect(() => {
    if (text.trim()) {
      checkPlagiarism(text);
    }
  }, [text]);

  const checkPlagiarism = async (textToCheck: string) => {
    setResult(prev => ({ ...prev, isChecking: true }));

    // Simulate plagiarism checking with mock data
    // In a real implementation, this would call an actual plagiarism detection API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock plagiarism detection results
    const mockMatches: PlagiarismMatch[] = generateMockMatches(textToCheck);
    const overallScore = calculateOverallScore(mockMatches, textToCheck.length);
    const sources = [...new Set(mockMatches.map(match => match.source))];

    setResult({
      overallScore,
      matches: mockMatches,
      sources,
      isChecking: false
    });
  };

  const generateMockMatches = (text: string): PlagiarismMatch[] => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const matches: PlagiarismMatch[] = [];

    // Generate some mock matches for demonstration
    sentences.forEach((sentence) => {
      if (Math.random() > 0.7 && sentence.trim().length > 30) { // 30% chance of match
        const startIndex = text.indexOf(sentence.trim());
        const endIndex = startIndex + sentence.trim().length;
        const similarityScore = Math.floor(Math.random() * 40) + 60; // 60-100% similarity

        matches.push({
          text: sentence.trim(),
          startIndex,
          endIndex,
          similarityScore,
          source: getMockSource(),
          url: 'https://example.com/source'
        });
      }
    });

    return matches;
  };

  const getMockSource = (): string => {
    const sources = [
      'Wikipedia.org',
      'Academic Journal - Nature',
      'Research Paper Database',
      'Educational Website',
      'Online Encyclopedia',
      'Scientific Publication',
      'University Repository'
    ];
    return sources[Math.floor(Math.random() * sources.length)];
  };

  const calculateOverallScore = (matches: PlagiarismMatch[], totalLength: number): number => {
    if (matches.length === 0) return 0;
    
    const totalMatchedChars = matches.reduce((sum, match) => sum + match.text.length, 0);
    return Math.floor((totalMatchedChars / totalLength) * 100);
  };

  const getScoreColor = (score: number): string => {
    if (score < 15) return 'text-green-600 bg-green-100';
    if (score < 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number): string => {
    if (score < 15) return 'Low Risk';
    if (score < 30) return 'Medium Risk';
    return 'High Risk';
  };

  const highlightText = (text: string, matches: PlagiarismMatch[]): React.ReactNode => {
    if (matches.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

    sortedMatches.forEach((match, index) => {
      // Add text before the match
      if (lastIndex < match.startIndex) {
        parts.push(text.slice(lastIndex, match.startIndex));
      }

      // Add the highlighted match
      parts.push(
        <span
          key={index}
          className="bg-red-200 border-b-2 border-red-400 cursor-pointer hover:bg-red-300 transition-colors"
          onClick={() => setSelectedMatch(match)}
          title={`${match.similarityScore}% similarity - Click for details`}
        >
          {match.text}
        </span>
      );

      lastIndex = match.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">🔍 Plagiarism Detection</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {result.isChecking ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking for plagiarism...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Overall Plagiarism Score</h3>
                  <div className={`px-4 py-2 rounded-full font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}% - {getScoreLabel(result.overallScore)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      result.overallScore < 15 ? 'bg-green-500' :
                      result.overallScore < 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(result.overallScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {result.matches.length} potential matches found across {result.sources.length} sources
                </p>
              </div>

              {/* Text with Highlights */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Text Analysis</h3>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {highlightText(text, result.matches)}
                </div>
                {result.matches.length > 0 && (
                  <p className="text-sm text-gray-500 mt-3">
                    💡 Click on highlighted text to see source details
                  </p>
                )}
              </div>

              {/* Sources List */}
              {result.sources.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Sources Found</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.sources.map((source, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <p className="font-medium text-gray-900">{source}</p>
                        <p className="text-sm text-gray-500">
                          {result.matches.filter(m => m.source === source).length} matches
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Details Modal */}
              {selectedMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Match Details</h4>
                      <button
                        onClick={() => setSelectedMatch(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Matched Text:</label>
                        <div className="bg-red-50 p-3 rounded border border-red-200">
                          <p className="text-gray-900">{selectedMatch.text}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Similarity:</label>
                          <div className={`px-3 py-2 rounded ${getScoreColor(selectedMatch.similarityScore)}`}>
                            {selectedMatch.similarityScore}%
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Source:</label>
                          <p className="px-3 py-2 bg-gray-100 rounded">{selectedMatch.source}</p>
                        </div>
                      </div>
                      {selectedMatch.url && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">URL:</label>
                          <a
                            href={selectedMatch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {selectedMatch.url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No Matches Found */}
              {result.matches.length === 0 && !result.isChecking && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-green-600 mb-2">No Plagiarism Detected</h3>
                  <p className="text-gray-600">Your text appears to be original!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
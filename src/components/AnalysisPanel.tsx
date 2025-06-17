import { useState, useEffect } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { analyzeText, type AnalysisReport } from '../utils/advancedAnalysis';
import { exportAnalysisReport, exportDocumentAsPDF, exportDocumentAsWord } from '../utils/exportUtils';
import { aiService } from '../utils/aiService';

interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisPanel({ isOpen, onClose }: AnalysisPanelProps) {
  const { content, currentDocument } = useDocumentStore();
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'scores' | 'suggestions' | 'export'>('scores');

  useEffect(() => {
    if (isOpen && content) {
      const newAnalysis = analyzeText(content);
      setAnalysis(newAnalysis);
      loadAISuggestions();
    }
  }, [isOpen, content]);

  const loadAISuggestions = async () => {
    if (!content || content.length < 10) return;
    
    setLoadingAI(true);
    try {
      const response = await aiService.generateWritingSuggestions(content);
      if (response.success && response.message) {
        setAiSuggestions(response.message.split('\n').filter(s => s.trim().length > 0));
      } else {
        // Fallback to local suggestions
        setAiSuggestions(aiService.generateFallbackSuggestions(content));
      }
    } catch (error) {
      setAiSuggestions(aiService.generateFallbackSuggestions(content));
    } finally {
      setLoadingAI(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };



  const handleExportAnalysis = () => {
    if (analysis && currentDocument) {
      exportAnalysisReport(currentDocument.title, analysis);
    }
  };

  const handleExportPDF = () => {
    if (currentDocument) {
      exportDocumentAsPDF(currentDocument.title, content);
    }
  };

  const handleExportWord = () => {
    if (currentDocument) {
      exportDocumentAsWord(currentDocument.title, content);
    }
  };

  if (!isOpen || !analysis) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-96 h-full overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Document Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-4 space-x-1">
            {[
              { id: 'scores', label: 'Scores' },
              { id: 'suggestions', label: 'AI Suggestions' },
              { id: 'export', label: 'Export' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-grammarly-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'scores' && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.score.overall)}`}>
                  {analysis.score.overall}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>

              {/* Detailed Scores */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Detailed Breakdown</h3>
                
                {[
                  { label: 'Correctness', value: analysis.score.correctness, description: 'Grammar and spelling accuracy' },
                  { label: 'Clarity', value: analysis.score.clarity, description: 'Clear and understandable writing' },
                  { label: 'Engagement', value: analysis.score.engagement, description: 'Compelling and interesting content' },
                  { label: 'Delivery', value: analysis.score.delivery, description: 'Flow and professional tone' }
                ].map((score) => (
                  <div key={score.label} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{score.label}</span>
                      <span className={`text-sm font-semibold ${getScoreColor(score.value)}`}>
                        {score.value}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score.value >= 85 ? 'bg-green-500' : 
                          score.value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{score.description}</p>
                  </div>
                ))}
              </div>

              {/* Text Statistics */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Text Statistics</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-semibold text-gray-900">{analysis.textStats.words}</div>
                    <div className="text-gray-600">Words</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-semibold text-gray-900">{analysis.textStats.sentences}</div>
                    <div className="text-gray-600">Sentences</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-semibold text-gray-900">{analysis.textStats.paragraphs}</div>
                    <div className="text-gray-600">Paragraphs</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-semibold text-gray-900">{analysis.textStats.avgWordsPerSentence}</div>
                    <div className="text-gray-600">Avg/Sentence</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm font-medium text-blue-900">Readability Level</div>
                  <div className="text-blue-700">{analysis.readabilityLevel}</div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-sm font-medium text-purple-900">Tone Analysis</div>
                  <div className="text-purple-700 capitalize">
                    {analysis.toneAnalysis.tone} ({analysis.toneAnalysis.confidence}% confidence)
                  </div>
                </div>
              </div>

              {/* Strengths and Improvements */}
              {analysis.strengths.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-green-700">Strengths</h3>
                  <ul className="text-sm space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.improvements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-red-700">Areas for Improvement</h3>
                  <ul className="text-sm space-y-1">
                    {analysis.improvements.slice(0, 5).map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">AI Writing Suggestions</h3>
                <button
                  onClick={loadAISuggestions}
                  disabled={loadingAI}
                  className="text-sm text-grammarly-blue hover:text-blue-700 disabled:opacity-50"
                >
                  {loadingAI ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {loadingAI ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grammarly-blue mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Generating AI suggestions...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {analysis.toneAnalysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Tone Suggestions</h4>
                  {analysis.toneAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Export Options</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleExportAnalysis}
                  className="w-full bg-grammarly-blue text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download Analysis Report (PDF)
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Download Document (PDF)
                </button>
                
                <button
                  onClick={handleExportWord}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download Document (Word)
                </button>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-2">What's Included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Overall writing score (1-100)</li>
                  <li>• Detailed breakdown by category</li>
                  <li>• Text statistics and readability</li>
                  <li>• Tone analysis</li>
                  <li>• Specific improvement suggestions</li>
                  <li>• Writing strengths identified</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
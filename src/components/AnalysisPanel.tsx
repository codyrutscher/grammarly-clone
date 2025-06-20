import React from 'react';
import type { WritingAnalytics } from '../utils/writingAnalytics';
import { analyzeWriting } from '../utils/writingAnalytics';
import { useDocumentStore } from '../store/useDocumentStore';

export const AnalysisPanel: React.FC = () => {
  const { currentDocument, suggestions } = useDocumentStore();
  const analytics = React.useMemo(() => {
    if (!currentDocument?.content) return null;
    return analyzeWriting(currentDocument.content, suggestions);
  }, [currentDocument?.content, suggestions]);

  if (!analytics) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        No document selected for analysis
      </div>
    );
  }

  const formatNumber = (num: number) => Number(num.toFixed(2));

  const renderMetricCard = (title: string, value: number | string, description?: string) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Readability
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderMetricCard(
            'Flesch-Kincaid Grade',
            formatNumber(analytics.readabilityScores.fleschKincaid),
            'Grade level required to understand the text'
          )}
          {renderMetricCard(
            'Coleman-Liau Index',
            formatNumber(analytics.readabilityScores.colemanLiau),
            'US grade level estimate'
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Vocabulary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderMetricCard(
            'Unique Words',
            analytics.vocabularyMetrics.uniqueWords,
            'Number of distinct words used'
          )}
          {renderMetricCard(
            'Vocabulary Richness',
            `${formatNumber(analytics.vocabularyMetrics.vocabularyRichness * 100)}%`,
            'Ratio of unique words to total words'
          )}
          {renderMetricCard(
            'Complex Words',
            analytics.vocabularyMetrics.complexWords,
            'Words with 3 or more syllables'
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Structure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderMetricCard(
            'Average Sentence Length',
            formatNumber(analytics.structureMetrics.averageSentenceLength),
            'Words per sentence'
          )}
          {renderMetricCard(
            'Paragraph Count',
            analytics.structureMetrics.paragraphCount
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Style Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderMetricCard(
            'Passive Voice',
            `${formatNumber(analytics.styleMetrics.passiveVoicePercentage)}%`,
            'Percentage of sentences using passive voice'
          )}
          {renderMetricCard(
            'Transition Words',
            `${formatNumber(analytics.styleMetrics.transitionWordPercentage)}%`,
            'Percentage of words that are transitions'
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Tone Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderMetricCard(
            'Formality',
            `${formatNumber(analytics.toneAnalysis.formality * 100)}%`,
            'How formal the writing style is'
          )}
          {renderMetricCard(
            'Confidence',
            `${formatNumber(analytics.toneAnalysis.confidence * 100)}%`,
            'Based on grammar and style suggestions'
          )}
        </div>
      </div>
    </div>
  );
}; 
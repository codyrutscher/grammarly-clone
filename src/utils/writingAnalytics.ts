import type { GrammarSuggestion } from '../store/useDocumentStore';

export interface WritingAnalytics {
  readabilityScores: {
    fleschKincaid: number;  // Standard reading level
    automatedReadability: number;  // Grade level estimate
    colemanLiau: number;  // Education level needed
  };
  vocabularyMetrics: {
    uniqueWords: number;
    complexWords: number;  // Words with 3+ syllables
    averageWordLength: number;
    vocabularyRichness: number;  // Type-token ratio
  };
  structureMetrics: {
    averageSentenceLength: number;
    sentenceLengthVariation: number;  // Standard deviation
    paragraphCount: number;
    averageParagraphLength: number;
  };
  styleMetrics: {
    passiveVoiceCount: number;
    passiveVoicePercentage: number;
    adverbCount: number;
    adverbPercentage: number;
    transitionWordCount: number;
    transitionWordPercentage: number;
  };
  toneAnalysis: {
    formality: number;  // 0-1 scale
    confidence: number;  // 0-1 scale
    emotion: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
}

// Helper function to count syllables in a word
function countSyllables(word: string): number {
  word = word.toLowerCase();
  word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

// Helper function to detect passive voice
function isPassiveVoice(sentence: string): boolean {
  const passivePattern = /\b(am|is|are|was|were|be|been|being)\s+(\w+ed|\w+en)\b/i;
  return passivePattern.test(sentence);
}

// Helper function to identify transition words
const transitionWords = new Set([
  'additionally', 'furthermore', 'moreover', 'however', 'nevertheless',
  'therefore', 'thus', 'consequently', 'meanwhile', 'subsequently',
  'although', 'despite', 'whereas', 'while', 'indeed', 'notably',
  'specifically', 'particularly', 'example', 'instance', 'illustration'
]);

// Helper function to calculate Flesch-Kincaid Grade Level
function calculateFleschKincaid(totalSyllables: number, totalWords: number, totalSentences: number): number {
  return 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
}

// Helper function to calculate Coleman-Liau Index
function calculateColemanLiau(totalChars: number, totalWords: number, totalSentences: number): number {
  const L = (totalChars / totalWords) * 100;
  const S = (totalSentences / totalWords) * 100;
  return 0.0588 * L - 0.296 * S - 15.8;
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b) / numbers.length;
  const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
  return Math.sqrt(variance);
}

export function analyzeWriting(text: string, suggestions: GrammarSuggestion[]): WritingAnalytics {
  // Split text into components
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));

  // Calculate basic counts
  const totalChars = text.replace(/\s/g, '').length;
  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const complexWords = words.filter(word => countSyllables(word) >= 3).length;

  // Calculate sentence lengths for variation
  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.trim().length > 0).length);

  // Count passive voice instances
  const passiveCount = sentences.filter(s => isPassiveVoice(s)).length;

  // Count transition words
  const transitionCount = words.filter(w => transitionWords.has(w.toLowerCase())).length;

  // Count adverbs (simple approximation)
  const adverbCount = words.filter(w => w.toLowerCase().endsWith('ly')).length;

  // Calculate tone metrics based on suggestions and word choice
  const formalityIndicators = words.filter(w => 
    /^(therefore|however|thus|consequently|furthermore|moreover)$/i.test(w)
  ).length;
  const informalityIndicators = words.filter(w => 
    /^(like|just|maybe|stuff|things|okay|yeah)$/i.test(w)
  ).length;
  const formality = Math.min(1, Math.max(0, 
    (formalityIndicators - informalityIndicators) / totalWords + 0.5
  ));

  // Calculate emotion metrics based on word lists and suggestions
  const emotionMetrics = {
    positive: 0,
    negative: 0,
    neutral: 1
  };

  // Return comprehensive analytics
  return {
    readabilityScores: {
      fleschKincaid: calculateFleschKincaid(totalSyllables, totalWords, totalSentences),
      automatedReadability: (4.71 * (totalChars / totalWords) + 0.5 * (totalWords / totalSentences) - 21.43),
      colemanLiau: calculateColemanLiau(totalChars, totalWords, totalSentences)
    },
    vocabularyMetrics: {
      uniqueWords: uniqueWords.size,
      complexWords,
      averageWordLength: totalChars / totalWords,
      vocabularyRichness: uniqueWords.size / totalWords
    },
    structureMetrics: {
      averageSentenceLength: totalWords / totalSentences,
      sentenceLengthVariation: calculateStandardDeviation(sentenceLengths),
      paragraphCount: paragraphs.length,
      averageParagraphLength: totalWords / paragraphs.length
    },
    styleMetrics: {
      passiveVoiceCount: passiveCount,
      passiveVoicePercentage: (passiveCount / totalSentences) * 100,
      adverbCount,
      adverbPercentage: (adverbCount / totalWords) * 100,
      transitionWordCount: transitionCount,
      transitionWordPercentage: (transitionCount / totalWords) * 100
    },
    toneAnalysis: {
      formality,
      confidence: Math.min(1, Math.max(0, 1 - (suggestions.length / totalSentences))),
      emotion: emotionMetrics
    }
  };
} 
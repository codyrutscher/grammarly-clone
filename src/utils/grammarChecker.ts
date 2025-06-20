import type { Suggestion } from '../types';

interface GrammarRule {
  pattern: RegExp;
  type: 'grammar' | 'spelling' | 'style' | 'readability';
  suggestion: string;
  explanation: string;
}

// Common grammar patterns and rules
const grammarRules: GrammarRule[] = [
  {
    pattern: /\b(its|it's)\b/g,
    type: 'grammar',
    suggestion: 'it is',
    explanation: 'Check if you mean "it is" (it\'s) or the possessive form (its)'
  },
  {
    pattern: /\b(your|you're)\b/g,
    type: 'grammar',
    suggestion: 'you are',
    explanation: 'Check if you mean "you are" (you\'re) or the possessive form (your)'
  },
  {
    pattern: /\b(there|their|they're)\b/g,
    type: 'grammar',
    suggestion: 'they are',
    explanation: 'Check if you mean "they are" (they\'re), possessive (their), or location (there)'
  },
  {
    pattern: /\b(to|too|two)\b/g,
    type: 'grammar',
    suggestion: 'to',
    explanation: 'Check if you mean "to" (direction), "too" (also/excessive), or "two" (number)'
  },
  {
    pattern: /\b(affect|effect)\b/g,
    type: 'grammar',
    suggestion: 'affect',
    explanation: 'Check if you mean "affect" (verb) or "effect" (noun)'
  }
];

// Style rules
const styleRules: GrammarRule[] = [
  {
    pattern: /\b(very|really|extremely)\b/g,
    type: 'style',
    suggestion: '',
    explanation: 'Consider using a stronger word instead of intensifiers'
  }
];

// Readability rules
const readabilityRules: GrammarRule[] = [
  {
    pattern: /([.!?])\s+([a-z])/g,
    type: 'readability',
    suggestion: '$1 $2',
    explanation: 'Start sentences with capital letters'
  }
];

// Spelling rules
const spellingRules: GrammarRule[] = [
  {
    pattern: /\b(teh|recieve|seperate|occured|accomodate)\b/g,
    type: 'spelling',
    suggestion: '',
    explanation: 'Common spelling mistake detected'
  }
];

// Punctuation and formatting rules
const punctuationRules = [
  {
    pattern: /\s+,/g,
    suggestion: ',',
    message: 'Remove space before comma',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\s+\./g,
    suggestion: '.',
    message: 'Remove space before period',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /,(\S)/g,
    suggestion: ', $1',
    message: 'Add space after comma',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\.(\w)/g,
    suggestion: '. $1',
    message: 'Add space after period',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\s{2,}/g,
    suggestion: ' ',
    message: 'Remove extra spaces',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\n{3,}/g,
    suggestion: '\n\n',
    message: 'Remove extra line breaks',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /([.!?])\s*([a-z])/g,
    suggestion: '$1 $2',
    message: 'Capitalize the first word after a sentence-ending punctuation',
    type: 'grammar' as const,
    severity: 'medium' as const
  }
];

// Additional common phrases and improvements
const commonPhraseRules = [
  {
    pattern: /\bon\s+a\s+daily\s+basis\b/gi,
    suggestion: 'daily',
    message: 'Consider using "daily" instead of "on a daily basis" for conciseness',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfirst\s+and\s+foremost\b/gi,
    suggestion: 'first',
    message: 'Consider using "first" instead of "first and foremost" for conciseness',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfree\s+gift\b/gi,
    suggestion: 'gift',
    message: 'A gift is already free by definition. Consider using just "gift"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfuture\s+plans\b/gi,
    suggestion: 'plans',
    message: 'Plans are for the future by definition. Consider using just "plans"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bunexpected\s+surprise\b/gi,
    suggestion: 'surprise',
    message: 'A surprise is unexpected by definition. Consider using just "surprise"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bclose\s+proximity\b/gi,
    suggestion: 'proximity',
    message: 'Proximity implies closeness. Consider using just "proximity"',
    type: 'style' as const,
    severity: 'low' as const
  }
];

export function checkText(text: string): Suggestion[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  console.log('Grammar Checker: Analyzing text:', {
    length: text.length,
    preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    wordCount: text.trim().split(/\s+/).length
  });

  const suggestions: Suggestion[] = [];
  const allRules = [
    ...grammarRules,
    ...styleRules,
    ...readabilityRules,
    ...spellingRules,
    ...punctuationRules,
    ...commonPhraseRules
  ];

  console.log('Grammar Checker: Total rules available:', {
    grammar: grammarRules.length,
    spelling: spellingRules.length,
    style: styleRules.length,
    readability: readabilityRules.length,
    punctuation: punctuationRules.length,
    commonPhrase: commonPhraseRules.length,
    total: allRules.length
  });

  allRules.forEach((rule, ruleIndex) => {
    const regex = rule.pattern;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const suggestion: Suggestion = {
        id: `${ruleIndex}-${match.index}-${Date.now()}-${Math.random()}`,
        type: rule.type,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        originalText: match[0],
        suggestion: rule.suggestion.replace(/\$1/g, match[1] || '').trim() || match[0],
        explanation: rule.explanation,
        category: rule.type
      };
      
      suggestions.push(suggestion);
    }
  });

  // Sort suggestions by position in text and remove duplicates
  const uniqueSuggestions = suggestions.filter((suggestion, index, arr) => 
    arr.findIndex(s => s.startIndex === suggestion.startIndex && s.endIndex === suggestion.endIndex) === index
  );

  console.log('Grammar Checker: Final results:', {
    totalSuggestions: suggestions.length,
    uniqueSuggestions: uniqueSuggestions.length,
    byType: uniqueSuggestions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: uniqueSuggestions.reduce((acc, s) => {
      acc[s.severity] = (acc[s.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return uniqueSuggestions.sort((a, b) => a.startIndex - b.startIndex);
}

export function applySuggestion(content: string, suggestion: Suggestion): string {
  return content.slice(0, suggestion.startIndex) +
    suggestion.suggestion +
    content.slice(suggestion.endIndex);
}

export function getTextStats(text: string) {
  if (!text || text.trim().length === 0) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      avgWordsPerSentence: 0,
      readabilityScore: 100
    };
  }

  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgCharsPerWord = words.length > 0 ? charactersNoSpaces / words.length : 0;
  
  // Simple readability score (Flesch Reading Ease approximation)
  const readabilityScore = sentences.length > 0 && words.length > 0 
    ? 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgCharsPerWord / 4.7)
    : 100;

  return {
    words: words.length,
    characters,
    charactersNoSpaces,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    readabilityScore: Math.max(0, Math.min(100, Math.round(readabilityScore)))
  };
} 
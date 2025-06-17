import { checkText, getTextStats } from './grammarChecker';
import type { GrammarSuggestion } from '../store/useDocumentStore';

export interface DetailedScore {
  overall: number;
  correctness: number;
  clarity: number;
  engagement: number;
  delivery: number;
}

export interface AnalysisReport {
  score: DetailedScore;
  suggestions: GrammarSuggestion[];
  improvements: string[];
  strengths: string[];
  textStats: ReturnType<typeof getTextStats>;
  readabilityLevel: string;
  toneAnalysis: {
    tone: string;
    confidence: number;
    suggestions: string[];
  };
}

export function analyzeText(text: string): AnalysisReport {
  const suggestions = checkText(text);
  const textStats = getTextStats(text);
  
  // Calculate detailed scores
  const correctnessScore = calculateCorrectnessScore(text, suggestions);
  const clarityScore = calculateClarityScore(text, textStats);
  const engagementScore = calculateEngagementScore(text, textStats);
  const deliveryScore = calculateDeliveryScore(text, textStats);
  
  const overallScore = Math.round(
    (correctnessScore + clarityScore + engagementScore + deliveryScore) / 4
  );

  const score: DetailedScore = {
    overall: overallScore,
    correctness: correctnessScore,
    clarity: clarityScore,
    engagement: engagementScore,
    delivery: deliveryScore
  };

  const improvements = generateImprovements(text, score, suggestions);
  const strengths = generateStrengths(text, score);
  const readabilityLevel = getReadabilityLevel(textStats.readabilityScore);
  const toneAnalysis = analyzeTone(text);

  return {
    score,
    suggestions,
    improvements,
    strengths,
    textStats,
    readabilityLevel,
    toneAnalysis
  };
}

function calculateCorrectnessScore(text: string, suggestions: GrammarSuggestion[]): number {
  const grammarErrors = suggestions.filter(s => s.type === 'grammar' || s.type === 'spelling');
  const words = text.trim().split(/\s+/).length;
  
  if (words === 0) return 100;
  
  const errorRate = grammarErrors.length / words;
  const score = Math.max(0, 100 - (errorRate * 200)); // Penalize errors heavily
  
  return Math.round(score);
}

function calculateClarityScore(text: string, stats: ReturnType<typeof getTextStats>): number {
  let score = 100;
  
  // Penalize overly long sentences
  if (stats.avgWordsPerSentence > 25) {
    score -= Math.min(30, (stats.avgWordsPerSentence - 25) * 2);
  }
  
  // Penalize very short or very long paragraphs
  const avgWordsPerParagraph = stats.words / stats.paragraphs;
  if (avgWordsPerParagraph < 20 || avgWordsPerParagraph > 150) {
    score -= 10;
  }
  
  // Bonus for good readability
  if (stats.readabilityScore > 60) {
    score += 5;
  }
  
  // Check for passive voice (simplified detection)
  const passiveIndicators = text.match(/\b(was|were|been|being)\s+\w+ed\b/gi) || [];
  const passiveRate = passiveIndicators.length / stats.sentences;
  if (passiveRate > 0.3) {
    score -= 15;
  }
  
  return Math.max(0, Math.round(score));
}

function calculateEngagementScore(text: string, stats: ReturnType<typeof getTextStats>): number {
  let score = 70; // Base score
  
  // Check for variety in sentence structure
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const lengthVariance = calculateVariance(sentenceLengths);
  
  if (lengthVariance > 20) {
    score += 15; // Good sentence variety
  } else if (lengthVariance < 5) {
    score -= 10; // Monotonous sentence structure
  }
  
  // Check for engaging elements
  const questions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  const engagingWords = text.match(/\b(amazing|incredible|fascinating|discover|reveal|secret|powerful|transform|breakthrough)\b/gi) || [];
  
  score += Math.min(10, questions * 2);
  score += Math.min(5, exclamations);
  score += Math.min(10, engagingWords.length);
  
  // Penalize overuse of filler words
  const fillerWords = text.match(/\b(very|really|quite|rather|fairly|pretty|somewhat|kind of|sort of)\b/gi) || [];
  const fillerRate = fillerWords.length / stats.words;
  if (fillerRate > 0.05) {
    score -= 15;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateDeliveryScore(text: string, stats: ReturnType<typeof getTextStats>): number {
  let score = 80; // Base score
  
  // Check for strong opening and closing
  const firstSentence = text.split(/[.!?]/)[0];
  const lastSentence = text.split(/[.!?]/).filter(s => s.trim().length > 0).pop();
  
  if (firstSentence && firstSentence.length > 10) {
    score += 5;
  }
  if (lastSentence && lastSentence.length > 10) {
    score += 5;
  }
  
  // Check for transition words
  const transitions = text.match(/\b(however|therefore|furthermore|moreover|consequently|additionally|meanwhile|nevertheless)\b/gi) || [];
  const transitionRate = transitions.length / stats.sentences;
  if (transitionRate > 0.1) {
    score += 10; // Good use of transitions
  }
  
  // Penalize repetitive words
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length > 4) { // Only count longer words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const repeatedWords = Object.values(wordFreq).filter(count => count > 3).length;
  score -= Math.min(20, repeatedWords * 3);
  
  // Check for professional tone indicators
  const professionalWords = text.match(/\b(analyze|implement|evaluate|demonstrate|establish|facilitate|optimize)\b/gi) || [];
  score += Math.min(10, professionalWords.length);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function generateImprovements(_text: string, score: DetailedScore, suggestions: GrammarSuggestion[]): string[] {
  const improvements: string[] = [];
  
  if (score.correctness < 80) {
    improvements.push("Fix grammar and spelling errors to improve correctness");
    if (suggestions.filter(s => s.type === 'grammar').length > 0) {
      improvements.push("Review subject-verb agreement and verb tenses");
    }
  }
  
  if (score.clarity < 70) {
    improvements.push("Break down long sentences for better clarity");
    improvements.push("Use more active voice instead of passive voice");
    improvements.push("Simplify complex sentence structures");
  }
  
  if (score.engagement < 70) {
    improvements.push("Add more variety to sentence length and structure");
    improvements.push("Include rhetorical questions to engage readers");
    improvements.push("Use stronger, more descriptive words");
    improvements.push("Reduce filler words like 'very', 'really', 'quite'");
  }
  
  if (score.delivery < 70) {
    improvements.push("Strengthen your opening sentence to hook readers");
    improvements.push("Add transition words to improve flow between ideas");
    improvements.push("Vary your vocabulary to avoid repetitive language");
    improvements.push("Create a stronger conclusion");
  }
  
  return improvements;
}

function generateStrengths(_text: string, score: DetailedScore): string[] {
  const strengths: string[] = [];
  
  if (score.correctness >= 90) {
    strengths.push("Excellent grammar and spelling accuracy");
  }
  
  if (score.clarity >= 80) {
    strengths.push("Clear and well-structured writing");
  }
  
  if (score.engagement >= 80) {
    strengths.push("Engaging and varied sentence structure");
  }
  
  if (score.delivery >= 80) {
    strengths.push("Strong flow and professional tone");
  }
  
  if (score.overall >= 85) {
    strengths.push("Overall excellent writing quality");
  }
  
  return strengths.length > 0 ? strengths : ["Keep writing to develop your strengths!"];
}

function getReadabilityLevel(score: number): string {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Difficult";
}

function analyzeTone(text: string): { tone: string; confidence: number; suggestions: string[] } {
  const toneIndicators = {
    formal: /\b(furthermore|therefore|consequently|nevertheless|establish|implement|demonstrate)\b/gi,
    casual: /\b(okay|yeah|cool|awesome|guys|stuff|things)\b/gi,
    positive: /\b(excellent|amazing|wonderful|great|fantastic|love|enjoy|excited)\b/gi,
    negative: /\b(terrible|awful|hate|worst|horrible|disappointed|frustrated)\b/gi,
    neutral: /\b(analyze|describe|explain|discuss|consider|examine)\b/gi
  };
  
  const scores = {
    formal: (text.match(toneIndicators.formal) || []).length,
    casual: (text.match(toneIndicators.casual) || []).length,
    positive: (text.match(toneIndicators.positive) || []).length,
    negative: (text.match(toneIndicators.negative) || []).length,
    neutral: (text.match(toneIndicators.neutral) || []).length
  };
  
  const dominantTone = Object.keys(scores).reduce((a, b) => 
    scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
  );
  
  const totalIndicators = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalIndicators > 0 
    ? Math.round((scores[dominantTone as keyof typeof scores] / totalIndicators) * 100)
    : 50;
  
  const suggestions: string[] = [];
  if (dominantTone === 'casual' && confidence > 70) {
    suggestions.push("Consider using more formal language for professional writing");
  }
  if (dominantTone === 'negative' && confidence > 60) {
    suggestions.push("Try to balance negative statements with constructive alternatives");
  }
  if (confidence < 50) {
    suggestions.push("Consider establishing a clearer tone throughout your writing");
  }
  
  return {
    tone: dominantTone,
    confidence,
    suggestions
  };
} 
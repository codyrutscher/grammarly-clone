import { checkText, getTextStats } from './grammarChecker';
import { aiService } from './aiService';
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

export async function analyzeText(text: string): Promise<AnalysisReport> {
  const suggestions = checkText(text);
  const textStats = getTextStats(text);
  
  // Get AI-powered analysis
  const aiAnalysis = await getAIAnalysis(text);
  
  // Calculate scores based on AI analysis and text metrics
  const score: DetailedScore = {
    overall: aiAnalysis.overall,
    correctness: aiAnalysis.correctness,
    clarity: aiAnalysis.clarity,
    engagement: aiAnalysis.engagement,
    delivery: aiAnalysis.delivery
  };

  const improvements = aiAnalysis.improvements;
  const strengths = aiAnalysis.strengths;
  const readabilityLevel = getReadabilityLevel(textStats.readabilityScore);
  const toneAnalysis = aiAnalysis.toneAnalysis;

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

async function getAIAnalysis(text: string): Promise<{
  overall: number;
  correctness: number;
  clarity: number;
  engagement: number;
  delivery: number;
  improvements: string[];
  strengths: string[];
  toneAnalysis: {
    tone: string;
    confidence: number;
    suggestions: string[];
  };
}> {
  if (!text || text.trim().length < 10) {
    return {
      overall: 0,
      correctness: 0,
      clarity: 0,
      engagement: 0,
      delivery: 0,
      improvements: ["Add more content to analyze"],
      strengths: [],
      toneAnalysis: {
        tone: "neutral",
        confidence: 50,
        suggestions: ["Write more content for better tone analysis"]
      }
    };
  }

  try {
    const prompt = `You are an expert writing analyst. Analyze the following text and provide a detailed, content-specific assessment. Your response must be tailored to this exact text - mention specific issues, word choices, and content elements you observe.

IMPORTANT: Vary your analysis based on the actual content. Don't use generic responses. Be specific about what you see in THIS text.

Return your analysis in this exact JSON format:

{
  "overall": <number 0-100>,
  "correctness": <number 0-100>,
  "clarity": <number 0-100>,
  "engagement": <number 0-100>,
  "delivery": <number 0-100>,
  "improvements": [<array of 3-5 specific improvements based on this text>],
  "strengths": [<array of 2-4 specific strengths you observe in this text>],
  "toneAnalysis": {
    "tone": "<specific tone you detect: academic/conversational/formal/informal/persuasive/narrative/etc>",
    "confidence": <number 0-100>,
    "suggestions": [<array of 2-3 tone-specific suggestions for this text>]
  }
}

Scoring Guidelines (be realistic and content-specific):
- Correctness (0-100): Count actual grammar/spelling errors. Deduct 5-10 points per error.
- Clarity (0-100): How clear is THIS specific text? Are sentences too long/short? Is word choice appropriate?
- Engagement (0-100): Is THIS content interesting? Does it have good examples, variety, compelling points?
- Delivery (0-100): How well does THIS text flow? Are transitions smooth? Is structure logical?

Content-Specific Instructions:
- If text has spelling errors, mention the specific words
- If sentences are too long/short, reference actual sentence lengths
- If content lacks examples, suggest specific types relevant to the topic
- If tone is inconsistent, point out where it shifts
- If vocabulary is repetitive, mention the repeated words
- If structure is unclear, suggest specific organizational improvements

Text Length: ${text.length} characters, ${text.split(/\s+/).length} words

Text to analyze:
"${text.substring(0, 2500)}"

Remember: Your analysis must be specific to THIS text. Mention actual content, word choices, and structural elements you observe. Vary your feedback based on the writing style, topic, and quality you see.`;

    const response = await aiService.chatWithAI([
      {
        role: 'system',
        content: 'You are a professional writing analyst. Analyze text and provide realistic, critical assessment scores. Be honest and don\'t inflate scores.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    
    if (response.success && response.message) {
      try {
        // Extract JSON from the response
        const jsonMatch = response.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          // Validate and sanitize the response
          return {
            overall: Math.max(0, Math.min(100, analysis.overall || 0)),
            correctness: Math.max(0, Math.min(100, analysis.correctness || 0)),
            clarity: Math.max(0, Math.min(100, analysis.clarity || 0)),
            engagement: Math.max(0, Math.min(100, analysis.engagement || 0)),
            delivery: Math.max(0, Math.min(100, analysis.delivery || 0)),
            improvements: Array.isArray(analysis.improvements) ? analysis.improvements.slice(0, 10) : [],
            strengths: Array.isArray(analysis.strengths) ? analysis.strengths.slice(0, 10) : [],
            toneAnalysis: {
              tone: analysis.toneAnalysis?.tone || "neutral",
              confidence: Math.max(0, Math.min(100, analysis.toneAnalysis?.confidence || 50)),
              suggestions: Array.isArray(analysis.toneAnalysis?.suggestions) ? analysis.toneAnalysis.suggestions.slice(0, 5) : []
            }
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse AI analysis response:', parseError);
      }
    }
  } catch (error) {
    console.warn('AI analysis failed, using fallback:', error);
  }

  // Fallback to realistic heuristic analysis
  return getFallbackAnalysis(text);
}

function getFallbackAnalysis(text: string): {
  overall: number;
  correctness: number;
  clarity: number;
  engagement: number;
  delivery: number;
  improvements: string[];
  strengths: string[];
  toneAnalysis: {
    tone: string;
    confidence: number;
    suggestions: string[];
  };
} {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Realistic scoring based on actual content analysis
  let correctness = 85; // Start optimistic, deduct for specific issues
  let clarity = 75;
  let engagement = 70;
  let delivery = 75;
  
  const improvements: string[] = [];
  const strengths: string[] = [];
  
  // Analyze specific grammar and spelling issues
  const commonErrors = {
    'teh': /\bteh\b/gi,
    'recieve': /\brecieve\b/gi,
    'seperate': /\bseperate\b/gi,
    'definately': /\bdefinately\b/gi,
    'alot': /\balot\b/gi,
    'loose_instead_of_lose': /\bloose\b/gi,
    'there_their_confusion': /\b(there|their|they're)\b/gi
  };
  
  let errorCount = 0;
  Object.entries(commonErrors).forEach(([error, pattern]) => {
    const matches = text.match(pattern);
    if (matches) {
      errorCount += matches.length;
      if (error.includes('confusion')) {
        improvements.push(`Check usage of "there," "their," and "they're" - found ${matches.length} instances that may need review`);
      } else {
        improvements.push(`Spelling error detected: "${error}" should be corrected`);
      }
    }
  });
  
  correctness -= errorCount * 8; // Deduct 8 points per error
  
  // Analyze sentence structure specifically
  if (avgWordsPerSentence > 30) {
    clarity -= 20;
    improvements.push(`Your sentences average ${Math.round(avgWordsPerSentence)} words each - consider breaking up longer sentences for better readability`);
  } else if (avgWordsPerSentence > 20) {
    clarity -= 10;
    improvements.push(`Some sentences are quite long (averaging ${Math.round(avgWordsPerSentence)} words) - vary your sentence length for better flow`);
  } else if (avgWordsPerSentence < 8) {
    engagement -= 15;
    improvements.push(`Your sentences are very short (averaging ${Math.round(avgWordsPerSentence)} words) - try combining some ideas for more sophisticated writing`);
  } else {
    strengths.push(`Good sentence length variety (averaging ${Math.round(avgWordsPerSentence)} words per sentence)`);
  }
  
  // Content length analysis
  if (wordCount < 30) {
    correctness -= 25;
    clarity -= 20;
    engagement -= 30;
    delivery -= 25;
    improvements.push(`Your text is very brief (${wordCount} words) - develop your ideas with more detail and examples`);
  } else if (wordCount < 100) {
    engagement -= 20;
    improvements.push(`Consider expanding your content (currently ${wordCount} words) with more supporting details`);
  } else if (wordCount > 500) {
    strengths.push(`Substantial content length (${wordCount} words) shows thorough development`);
  } else {
    strengths.push(`Good content length (${wordCount} words) for your topic`);
  }
  
  // Analyze word repetition specifically
  const wordFreq: { [key: string]: number } = {};
  const significantWords = words.filter(word => word.length > 4 && !/^(that|this|with|from|they|were|been|have|will|would|could|should)$/i.test(word));
  
  significantWords.forEach(word => {
    const lowWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (lowWord.length > 4) {
      wordFreq[lowWord] = (wordFreq[lowWord] || 0) + 1;
    }
  });
  
  const repeatedWords = Object.entries(wordFreq).filter(([_, count]) => count > 3);
  if (repeatedWords.length > 0) {
    engagement -= 15;
    delivery -= 10;
    const topRepeated = repeatedWords.sort((a, b) => b[1] - a[1])[0];
    improvements.push(`The word "${topRepeated[0]}" appears ${topRepeated[1]} times - try using synonyms for variety`);
  }
  
  // Analyze paragraph structure
  if (paragraphs.length === 1 && wordCount > 100) {
    delivery -= 15;
    improvements.push('Consider breaking your text into multiple paragraphs to improve organization and readability');
  } else if (paragraphs.length > 1) {
    strengths.push(`Good paragraph structure with ${paragraphs.length} distinct sections`);
  }
  
  // Analyze punctuation variety
  const hasQuestions = text.includes('?');
  const hasExclamations = text.includes('!');
  const hasCommas = text.includes(',');
  const hasSemicolons = text.includes(';');
  
  if (!hasCommas && wordCount > 50) {
    clarity -= 10;
    improvements.push('Consider using commas to break up complex ideas within sentences');
  }
  
  if (hasQuestions) {
    strengths.push('Good use of questions to engage readers');
    engagement += 5;
  }
  
  if (hasExclamations && wordCount > 100) {
    engagement += 3;
  }
  
  if (hasSemicolons) {
    strengths.push('Sophisticated punctuation use with semicolons');
    delivery += 5;
  }
  
  // Content-specific tone analysis
  let tone = 'neutral';
  let toneConfidence = 60;
  const toneAnalysisResult = analyzeContentTone(text);
  tone = toneAnalysisResult.tone;
  toneConfidence = toneAnalysisResult.confidence;
  
  const toneSuggestions: string[] = [];
  if (toneAnalysisResult.tone === 'academic' && !text.match(/\b(analyze|evaluate|demonstrate|research|study)\b/gi)) {
    toneSuggestions.push('For academic writing, consider using more analytical language');
  } else if (toneAnalysisResult.tone === 'conversational' && text.match(/\b(you|your)\b/gi)) {
    toneSuggestions.push('Your conversational tone works well - maintain this engaging approach');
  } else if (toneAnalysisResult.tone === 'formal' && text.length < 200) {
    toneSuggestions.push('Your formal tone is appropriate - consider expanding with more detailed analysis');
  }
  
  // Ensure realistic bounds
  correctness = Math.max(20, Math.min(95, correctness));
  clarity = Math.max(25, Math.min(90, clarity));
  engagement = Math.max(20, Math.min(85, engagement));
  delivery = Math.max(25, Math.min(90, delivery));
  
  const overall = Math.round((correctness + clarity + engagement + delivery) / 4);
  
  // Add content-specific strengths
  if (text.match(/\b(however|therefore|furthermore|moreover|additionally|consequently)\b/gi)) {
    strengths.push('Effective use of transition words to connect ideas');
    delivery += 5;
  }
  
  if (text.match(/\b(example|instance|specifically|particularly)\b/gi)) {
    strengths.push('Good use of examples to support your points');
    engagement += 5;
  }
  
  if (correctness >= 80) strengths.push('Strong grammar and spelling accuracy');
  if (clarity >= 75) strengths.push('Clear and understandable writing style');
  if (engagement >= 75) strengths.push('Engaging content that holds reader interest');
  if (delivery >= 75) strengths.push('Well-structured and organized presentation');
  
  // Ensure we have some feedback
  if (improvements.length === 0) {
    improvements.push('Continue developing your writing with more practice and varied sentence structures');
  }
  if (strengths.length === 0) {
    strengths.push('Your writing shows effort and potential for improvement');
  }
  
  return {
    overall: Math.min(95, overall), // Cap at 95 for fallback analysis
    correctness,
    clarity,
    engagement,
    delivery,
    improvements: improvements.slice(0, 5), // Limit to 5 most important
    strengths: strengths.slice(0, 4), // Limit to 4 key strengths
    toneAnalysis: {
      tone,
      confidence: toneConfidence,
      suggestions: toneSuggestions.slice(0, 3)
    }
  };
}

function analyzeContentTone(text: string): { tone: string; confidence: number } {
  const indicators = {
    academic: /\b(analyze|research|study|evaluate|demonstrate|hypothesis|methodology|conclusion|furthermore|moreover)\b/gi,
    conversational: /\b(you|your|we|us|I|me|really|pretty|kind of|sort of|anyway|basically)\b/gi,
    formal: /\b(therefore|consequently|furthermore|establish|implement|facilitate|demonstrate|substantial)\b/gi,
    persuasive: /\b(should|must|need to|important|crucial|essential|believe|convince|argument)\b/gi,
    narrative: /\b(then|next|after|before|while|during|story|experience|remember|happened)\b/gi,
    technical: /\b(system|process|method|function|analyze|data|results|performance|efficiency)\b/gi
  };
  
  const scores: { [key: string]: number } = {};
  let totalMatches = 0;
  
  Object.entries(indicators).forEach(([toneType, pattern]) => {
    const matches = text.match(pattern) || [];
    scores[toneType] = matches.length;
    totalMatches += matches.length;
  });
  
  if (totalMatches === 0) {
    return { tone: 'neutral', confidence: 50 };
  }
  
  const dominantTone = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );
  
  const confidence = Math.min(90, Math.round((scores[dominantTone] / totalMatches) * 100));
  
  return { tone: dominantTone, confidence };
}

function getReadabilityLevel(score: number): string {
  if (score >= 90) return 'Very Easy (5th grade)';
  if (score >= 80) return 'Easy (6th grade)';
  if (score >= 70) return 'Fairly Easy (7th grade)';
  if (score >= 60) return 'Standard (8th-9th grade)';
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (score >= 30) return 'Difficult (College level)';
  return 'Very Difficult (Graduate level)';
} 
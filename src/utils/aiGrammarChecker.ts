import type { GrammarSuggestion } from '../store/useDocumentStore';
import type { WritingSettings, WritingMode } from '../types';
import { useSuggestionFeedbackStore } from '../store/useSuggestionFeedbackStore';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface OpenAISuggestion {
  original: string;
  suggestion: string;
  reason: string;
  type: 'grammar' | 'spelling' | 'style' | 'readability';
  severity: 'low' | 'medium' | 'high';
  start_pos: number;
  end_pos: number;
}

export interface GrammarSuggestion {
  id: string;
  start: number;
  end: number;
  text: string;
  replacement: string;
  type: 'grammar' | 'style' | 'tone' | 'structure';
  severity: 'error' | 'warning' | 'suggestion';
  explanation: string;
}

// Generate system prompt based on writing settings
function generateSystemPrompt(settings: WritingSettings): string {
  let basePrompt = `You are an expert writing assistant. Analyze the provided text and identify specific writing improvements.`;

  // Add user feedback context
  const feedbackStats = useSuggestionFeedbackStore.getState().getFeedbackStats();
  
  if (feedbackStats.commonAccepted.length > 0 || feedbackStats.commonRejected.length > 0) {
    basePrompt += `\n\nBased on this user's history:`;
    
    if (feedbackStats.commonAccepted.length > 0) {
      basePrompt += `\nThey typically accept suggestions like: ${feedbackStats.commonAccepted.slice(0, 5).join(', ')}`;
    }
    
    if (feedbackStats.commonRejected.length > 0) {
      basePrompt += `\nThey typically reject suggestions like: ${feedbackStats.commonRejected.slice(0, 5).join(', ')}`;
    }
    
    // Add acceptance rates by type
    const rates = feedbackStats.acceptanceRate;
    if (Object.keys(rates).length > 0) {
      basePrompt += `\n\nSuggestion acceptance rates by type:`;
      Object.entries(rates).forEach(([type, rate]) => {
        basePrompt += `\n- ${type}: ${Math.round(rate)}%`;
      });
      
      // Adjust suggestion strategy based on acceptance rates
      const highAcceptanceTypes = Object.entries(rates)
        .filter(([, rate]) => rate > 70)
        .map(([type]) => type);
        
      if (highAcceptanceTypes.length > 0) {
        basePrompt += `\n\nPrioritize suggestions of types: ${highAcceptanceTypes.join(', ')} as they are more likely to be helpful to this user.`;
      }
    }
  }

  // Add language variant specific instructions
  const languageInstructions = {
    us: "Use American English spelling (e.g., 'color', 'organize', 'analyze').",
    uk: "Use British English spelling (e.g., 'colour', 'organise', 'analyse').",
    au: "Use Australian English spelling and conventions.",
    ca: "Use Canadian English spelling and conventions."
  };

  // Add academic style specific instructions
  const academicInstructions = {
    mla: "Follow MLA style guidelines: use present tense for literary analysis, avoid contractions, use formal academic language.",
    apa: "Follow APA style guidelines: use past tense for research descriptions, emphasize clear and concise writing, avoid bias.",
    chicago: "Follow Chicago style guidelines: maintain formal academic tone, use precise citations format.",
    harvard: "Follow Harvard referencing style: maintain academic formality, use third person perspective.",
    none: "Use general academic writing conventions."
  };

  // Add writing mode specific instructions
  const modeInstructions = {
    academic: "Focus on formal academic writing: avoid contractions, use sophisticated vocabulary, maintain objective tone.",
    business: "Focus on professional business writing: be concise, use active voice, maintain professional tone.",
    casual: "Allow for conversational tone while maintaining clarity and correctness.",
    creative: "Allow for creative expression while maintaining grammatical accuracy."
  };

  // Add checking mode specific instructions
  const checkingInstructions = {
    speed: "Focus only on critical errors: grammar mistakes, spelling errors, and major clarity issues.",
    standard: "Provide balanced checking: grammar, spelling, basic style, and readability improvements.",
    comprehensive: "Provide thorough analysis: grammar, spelling, advanced style, readability, tone, and structural improvements."
  };

  basePrompt += `\n\n${languageInstructions[settings.languageVariant]}`;
  basePrompt += `\n${academicInstructions[settings.academicStyle]}`;
  basePrompt += `\n${modeInstructions[settings.writingMode]}`;
  basePrompt += `\n${checkingInstructions[settings.checkingMode]}`;

  // Add focus areas based on checking mode
  if (settings.checkingMode === 'speed' || settings.criticalErrorsOnly) {
    basePrompt += `\n\nFocus ONLY on:
1. Grammar errors (subject-verb agreement, tense consistency, etc.)
2. Spelling mistakes
3. Critical clarity issues that affect comprehension`;
  } else {
    basePrompt += `\n\nFocus on:
1. Grammar errors (subject-verb agreement, tense consistency, etc.)
2. Spelling mistakes  
3. Style improvements (word choice, sentence variety, clarity)
4. Readability issues (sentence length, passive voice, filler words)`;
  }

  basePrompt += `\n\nFor each issue found, provide:
- The exact original text that needs changing
- The suggested replacement
- A clear reason why this change improves the writing
- The type of issue (grammar, spelling, style, readability)
- Severity level (low, medium, high)
- The exact character positions where the issue starts and ends

Respond with a JSON array of suggestions. Each suggestion should have this exact format:
{
  "original": "exact text to replace",
  "suggestion": "improved text",
  "reason": "explanation of why this is better",
  "type": "grammar|spelling|style|readability",
  "severity": "low|medium|high",
  "start_pos": number,
  "end_pos": number
}

Only suggest improvements that genuinely make the writing better. Be specific and actionable.`;

  return basePrompt;
}

export async function checkTextWithAI(text: string, settings?: WritingSettings): Promise<GrammarSuggestion[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Check if API key is configured
  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
    console.warn('AI Grammar Checker: OpenAI API key not configured, returning empty suggestions');
    return [];
  }

  // Use default settings if none provided
  const defaultSettings: WritingSettings = {
    academicStyle: 'none',
    languageVariant: 'us',
    checkingMode: 'standard',
    writingMode: 'academic',
    criticalErrorsOnly: false
  };

  const currentSettings = settings || defaultSettings;

  console.log('AI Grammar Checker: Analyzing text with OpenAI...', {
    length: text.length,
    preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    settings: currentSettings
  });

  try {
    const systemPrompt = generateSystemPrompt(currentSettings);
    
    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please analyze this text and provide specific writing suggestions:\n\n"${text}"`
          }
        ],
        max_tokens: currentSettings.checkingMode === 'speed' ? 1000 : 2000,
        temperature: 0.3
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      
      // Handle specific error cases
      if (response.status === 401) {
        console.error('AI Grammar Checker: Invalid API key');
        return [];
      } else if (response.status === 429) {
        console.error('AI Grammar Checker: Rate limit exceeded');
        return [];
      } else if (response.status >= 500) {
        console.error('AI Grammar Checker: OpenAI server error');
        return [];
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error('No response from OpenAI');
      return [];
    }

    console.log('AI Grammar Checker: Raw OpenAI response:', aiResponse);

    // Parse the JSON response
    let aiSuggestions: OpenAISuggestion[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiSuggestions = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array found, try parsing the entire response
        aiSuggestions = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, trying text parsing:', parseError);
      return parseTextResponse(aiResponse, text);
    }

    if (!Array.isArray(aiSuggestions)) {
      console.warn('AI response is not an array, returning empty suggestions');
      return [];
    }

    console.log('AI Grammar Checker: Parsed suggestions:', aiSuggestions.length);

    // Filter out invalid suggestions
    const filteredSuggestions = aiSuggestions.filter(suggestion => {
      return suggestion.original && 
             suggestion.suggestion && 
             typeof suggestion.start_pos === 'number' &&
             typeof suggestion.end_pos === 'number' &&
             suggestion.start_pos >= 0 &&
             suggestion.end_pos <= text.length &&
             suggestion.start_pos < suggestion.end_pos;
    });

    console.log('AI Grammar Checker: Filtered suggestions:', filteredSuggestions.length);

    // Convert OpenAI suggestions to our format
    const suggestions: GrammarSuggestion[] = filteredSuggestions
      .map((aiSugg, index) => {
        // Validate the AI suggestion
        if (!aiSugg.original || !aiSugg.suggestion || typeof aiSugg.start_pos !== 'number') {
          console.warn('Invalid AI suggestion:', aiSugg);
          return null;
        }

        // Verify the positions are correct
        const actualText = text.substring(aiSugg.start_pos, aiSugg.end_pos);
        if (actualText !== aiSugg.original) {
          console.warn('Position mismatch, attempting to find correct position:', {
            expected: aiSugg.original,
            actualAtPosition: actualText,
            positions: `${aiSugg.start_pos}-${aiSugg.end_pos}`
          });
          
          // Try to find the text in the document
          const foundIndex = text.indexOf(aiSugg.original);
          if (foundIndex !== -1) {
            aiSugg.start_pos = foundIndex;
            aiSugg.end_pos = foundIndex + aiSugg.original.length;
            console.log('Corrected positions:', aiSugg.start_pos, aiSugg.end_pos);
          } else {
            console.warn('Could not find original text in document, skipping suggestion');
            return null;
          }
        }

        return {
          id: `ai-${index}-${Date.now()}-${Math.random()}`,
          type: aiSugg.type,
          start: aiSugg.start_pos,
          end: aiSugg.end_pos,
          original: aiSugg.original,
          suggestion: aiSugg.suggestion,
          message: aiSugg.reason,
          severity: aiSugg.severity
        } as GrammarSuggestion;
      })
      .filter((suggestion): suggestion is GrammarSuggestion => suggestion !== null);

    console.log('AI Grammar Checker: Processed suggestions:', {
      total: suggestions.length,
      byType: suggestions.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: suggestions.reduce((acc, s) => {
        acc[s.severity] = (acc[s.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    // Filter suggestions based on user feedback patterns
    const feedbackStats = useSuggestionFeedbackStore.getState().getFeedbackStats();
    const uniqueSuggestions = [...new Set(suggestions)];
    const personalizedSuggestions = uniqueSuggestions
      .sort((a, b) => {
        // Prioritize suggestion types with higher acceptance rates
        const aRate = feedbackStats.acceptanceRate[a.type] || 50;
        const bRate = feedbackStats.acceptanceRate[b.type] || 50;
        return bRate - aRate;
      })
      .filter(suggestion => {
        // Filter out suggestions similar to commonly rejected ones
        const isCommonlyRejected = feedbackStats.commonRejected.some(
          rejected => suggestion.suggestion.toLowerCase().includes(rejected.toLowerCase())
        );
        return !isCommonlyRejected;
      });

    console.log('Grammar Checker: Final results:', {
      totalSuggestions: personalizedSuggestions.length,
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

    return personalizedSuggestions as GrammarSuggestion[];

  } catch (error) {
    console.error('AI Grammar Checker: Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('AI Grammar Checker: Request timed out');
      } else if (error.message.includes('fetch')) {
        console.error('AI Grammar Checker: Network error');
      }
    }
    
    return [];
  }
}

// Fallback function to parse text-based responses
function parseTextResponse(response: string, originalText: string): GrammarSuggestion[] {
  console.log('Attempting to parse text response for suggestions...');
  
  // This is a simple fallback - you could make this more sophisticated
  const suggestions: GrammarSuggestion[] = [];
  
  // Look for common patterns in text responses
  const lines = response.split('\n');
  lines.forEach((line, index) => {
    // Simple pattern matching for suggestions
    const suggestionMatch = line.match(/["']([^"']+)["']\s*(?:should be|→|->|to)\s*["']([^"']+)["']/i);
    if (suggestionMatch) {
      const original = suggestionMatch[1];
      const suggestion = suggestionMatch[2];
      const foundIndex = originalText.indexOf(original);
      
      if (foundIndex !== -1) {
        suggestions.push({
          id: `fallback-${index}-${Date.now()}`,
          type: 'style',
          start: foundIndex,
          end: foundIndex + original.length,
          original,
          suggestion,
          message: 'AI-suggested improvement',
          severity: 'low'
        });
      }
    }
  });
  
  return suggestions;
}

// Function to get AI-powered text improvement suggestions
export async function getAITextSuggestions(text: string, _context?: string): Promise<string[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful writing assistant. Provide 3-5 brief, actionable suggestions to improve the given text. Focus on clarity, engagement, and readability. Each suggestion should be one sentence and start with an action verb.`
          },
          {
            role: 'user',
            content: `Please provide writing improvement suggestions for this text:\n\n"${text}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return [];
    }

    // Parse suggestions from the response
    const suggestions = aiResponse
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
      .filter((suggestion: string) => suggestion.length > 10);

    return suggestions.slice(0, 5); // Limit to 5 suggestions

  } catch (error) {
    console.error('Error getting AI text suggestions:', error);
    return [];
  }
}

export function checkGrammarAndStyle(text: string, mode: WritingMode | null): GrammarSuggestion[] {
  const suggestions: GrammarSuggestion[] = [];

  if (!text || !mode) return suggestions;

  // Apply mode-specific rules
  const { rules } = mode;

  // Helper function to create a suggestion
  const createSuggestion = (
    id: string,
    start: number,
    end: number,
    text: string,
    replacement: string,
    type: GrammarSuggestion['type'],
    severity: GrammarSuggestion['severity'],
    explanation: string
  ): GrammarSuggestion => ({
    id,
    start,
    end,
    text,
    replacement,
    type,
    severity,
    explanation
  });

  // Check sentence length based on mode preferences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  sentences.forEach((sentence, index) => {
    const words = sentence.trim().split(/\s+/);
    const isLong = words.length > 25;
    const isShort = words.length < 8;

    if (rules.style.sentenceLength === 'short' && isLong) {
      suggestions.push(createSuggestion(
        `sentence-length-${index}`,
        text.indexOf(sentence),
        text.indexOf(sentence) + sentence.length,
        sentence,
        sentence, // User needs to split this manually
        'structure',
        'warning',
        'Consider breaking this long sentence into smaller ones for better readability.'
      ));
    } else if (rules.style.sentenceLength === 'long' && isShort) {
      suggestions.push(createSuggestion(
        `sentence-length-${index}`,
        text.indexOf(sentence),
        text.indexOf(sentence) + sentence.length,
        sentence,
        sentence, // User needs to expand this manually
        'structure',
        'suggestion',
        'Consider expanding this sentence to provide more detail or combine it with another sentence.'
      ));
    }
  });

  // Check for passive voice if not allowed
  if (!rules.style.allowPassiveVoice) {
    const passivePattern = /\b(am|is|are|was|were|be|been|being)\s+(\w+ed|\w+en)\b/gi;
    let match;
    let passiveIndex = 0;
    while ((match = passivePattern.exec(text)) !== null) {
      suggestions.push(createSuggestion(
        `passive-voice-${passiveIndex++}`,
        match.index,
        match.index + match[0].length,
        match[0],
        match[0], // User needs to rephrase this manually
        'style',
        'warning',
        'Consider using active voice for more direct and engaging writing.'
      ));
    }
  }

  // Check vocabulary level
  const complexWordPattern = /\b\w{12,}\b/g;
  const simpleWordReplacements: Record<string, string> = {
    'utilize': 'use',
    'implement': 'use',
    'facilitate': 'help',
    'commence': 'start',
    'terminate': 'end',
    'endeavor': 'try',
    'subsequent': 'next',
    'demonstrate': 'show',
    'initiate': 'start',
    'finalize': 'finish'
  };

  if (rules.style.vocabulary === 'simple') {
    // Flag complex words
    let match;
    let complexIndex = 0;
    while ((match = complexWordPattern.exec(text)) !== null) {
      suggestions.push(createSuggestion(
        `complex-word-${complexIndex++}`,
        match.index,
        match.index + match[0].length,
        match[0],
        match[0], // User needs to choose a simpler word
        'style',
        'suggestion',
        'Consider using a simpler word for better readability.'
      ));
    }

    // Suggest simpler alternatives
    Object.entries(simpleWordReplacements).forEach(([complex, simple], index) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push(createSuggestion(
          `simple-word-${index}-${match.index}`,
          match.index,
          match.index + complex.length,
          match[0],
          simple,
          'style',
          'suggestion',
          `Consider using "${simple}" instead of "${complex}" for simpler writing.`
        ));
      }
    });
  }

  // Check formality level
  const informalWords = ['stuff', 'things', 'like', 'kind of', 'sort of', 'lots of', 'tons of'];
  if (rules.tone.formality === 'formal') {
    informalWords.forEach((word, index) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push(createSuggestion(
          `informal-word-${index}-${match.index}`,
          match.index,
          match.index + word.length,
          match[0],
          match[0], // User needs to choose a more formal alternative
          'tone',
          'warning',
          'Consider using more formal language.'
        ));
      }
    });
  }

  // Check for topic sentences if required
  if (rules.structure.requireTopicSentences) {
    const paragraphs = text.split(/\n\s*\n/);
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim().length > 0) {
        const firstSentence = paragraph.split(/[.!?]+/)[0];
        if (firstSentence.length < 10 || /^(However|Moreover|Furthermore|Therefore|Thus|Also)/.test(firstSentence)) {
          suggestions.push(createSuggestion(
            `topic-sentence-${index}`,
            text.indexOf(paragraph),
            text.indexOf(paragraph) + firstSentence.length,
            firstSentence,
            firstSentence, // User needs to write a proper topic sentence
            'structure',
            'warning',
            'Consider starting the paragraph with a clear topic sentence that introduces the main idea.'
          ));
        }
      }
    });
  }

  // Check for transitions if required
  if (rules.structure.requireTransitions) {
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'nevertheless', 'thus', 'consequently'];
    const paragraphs = text.split(/\n\s*\n/);
    paragraphs.forEach((paragraph, index) => {
      if (index > 0 && paragraph.trim().length > 0) {
        const hasTransition = transitionWords.some(word => 
          new RegExp(`^${word}\\b`, 'i').test(paragraph.trim())
        );
        if (!hasTransition) {
          suggestions.push(createSuggestion(
            `transition-${index}`,
            text.indexOf(paragraph),
            text.indexOf(paragraph),
            '',
            '', // User needs to add a transition
            'structure',
            'suggestion',
            'Consider adding a transition word or phrase to improve flow between paragraphs.'
          ));
        }
      }
    });
  }

  // Check paragraph length
  const paragraphs = text.split(/\n\s*\n/);
  paragraphs.forEach((paragraph, index) => {
    const words = paragraph.trim().split(/\s+/);
    const isLong = words.length > 150;
    const isShort = words.length < 30;

    if (rules.structure.paragraphLength === 'short' && isLong) {
      suggestions.push(createSuggestion(
        `paragraph-length-${index}`,
        text.indexOf(paragraph),
        text.indexOf(paragraph) + paragraph.length,
        paragraph,
        paragraph, // User needs to split this manually
        'structure',
        'warning',
        'Consider breaking this long paragraph into smaller ones for better readability.'
      ));
    } else if (rules.structure.paragraphLength === 'long' && isShort) {
      suggestions.push(createSuggestion(
        `paragraph-length-${index}`,
        text.indexOf(paragraph),
        text.indexOf(paragraph) + paragraph.length,
        paragraph,
        paragraph, // User needs to expand this manually
        'structure',
        'suggestion',
        'Consider expanding this paragraph or combining it with another one.'
      ));
    }
  });

  // Check citation format if required
  if (rules.citations.required) {
    const citationStyle = rules.citations.style;
    const citationPatterns: Record<string, RegExp> = {
      APA: /\([\w\s]+,\s+\d{4}\)/,
      MLA: /\([\w\s]+\s+\d+\)/,
      Chicago: /\d+\./
    };

    if (citationStyle !== 'none' && citationStyle in citationPatterns) {
      const pattern = citationPatterns[citationStyle];
      if (!pattern.test(text)) {
        suggestions.push(createSuggestion(
          'citation-missing',
          text.length,
          text.length,
          '',
          '',
          'style',
          'error',
          `This document requires ${citationStyle} style citations.`
        ));
      }
    }
  }

  return suggestions;
}

export function getWritingScore(text: string, mode: WritingMode | null): number {
  if (!text || !mode) return 0;

  const suggestions = checkGrammarAndStyle(text, mode);
  const textLength = text.length;

  // Calculate base score
  let score = 100;

  // Deduct points based on suggestion severity
  suggestions.forEach(suggestion => {
    switch (suggestion.severity) {
      case 'error':
        score -= 10;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'suggestion':
        score -= 2;
        break;
    }
  });

  // Normalize score based on text length
  const normalizedScore = Math.max(0, Math.min(100, score * (1 + Math.log10(textLength / 1000 + 1))));

  return Math.round(normalizedScore);
} 
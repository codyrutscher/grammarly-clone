import type { GrammarSuggestion } from '../store/useDocumentStore';
import type { WritingSettings } from '../types';

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

// Generate system prompt based on writing settings
function generateSystemPrompt(settings: WritingSettings): string {
  let basePrompt = `You are an expert writing assistant. Analyze the provided text and identify specific writing improvements.`;

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
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
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
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      aiSuggestions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.log('Attempting to extract suggestions from text response...');
      
      // Fallback: try to extract suggestions from a text response
      return parseTextResponse(aiResponse, text);
    }

    if (!Array.isArray(aiSuggestions)) {
      console.error('OpenAI response is not an array:', aiSuggestions);
      return [];
    }

    // Filter suggestions based on settings
    let filteredSuggestions = aiSuggestions;
    if (currentSettings.criticalErrorsOnly || currentSettings.checkingMode === 'speed') {
      filteredSuggestions = aiSuggestions.filter(s => 
        s.type === 'grammar' || 
        s.type === 'spelling' || 
        (s.type === 'readability' && s.severity === 'high')
      );
    }

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

    return suggestions.sort((a, b) => a.start - b.start);

  } catch (error) {
    console.error('AI Grammar Checker: Error:', error);
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
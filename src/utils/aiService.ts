// OpenAI API key is now loaded from environment variables

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  async chatWithAI(messages: ChatMessage[]): Promise<AIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        return {
          success: true,
          message: data.choices[0].message.content.trim()
        };
      } else {
        return {
          success: false,
          error: 'No response from AI'
        };
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateWritingSuggestions(text: string): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a professional writing assistant. Analyze the provided text and give specific, actionable suggestions to improve clarity, engagement, and overall quality. Focus on concrete improvements.'
      },
      {
        role: 'user',
        content: `Please analyze this text and provide specific writing improvement suggestions:\n\n"${text}"`
      }
    ];

    return this.chatWithAI(messages);
  }

  async improveText(text: string, improvementType: 'clarity' | 'engagement' | 'tone' | 'structure'): Promise<AIResponse> {
    const prompts = {
      clarity: 'Rewrite this text to be clearer and more concise while maintaining the original meaning:',
      engagement: 'Rewrite this text to be more engaging and compelling while keeping the core message:',
      tone: 'Adjust the tone of this text to be more professional and polished:',
      structure: 'Improve the structure and flow of this text for better readability:'
    };

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a professional writing editor. Provide improved versions of text based on the specific request.'
      },
      {
        role: 'user',
        content: `${prompts[improvementType]}\n\n"${text}"`
      }
    ];

    return this.chatWithAI(messages);
  }

  async generateContent(prompt: string, contentType: 'paragraph' | 'outline' | 'summary' | 'expansion'): Promise<AIResponse> {
    const systemPrompts = {
      paragraph: 'Generate a well-structured paragraph based on the user\'s request.',
      outline: 'Create a detailed outline based on the user\'s topic or request.',
      summary: 'Provide a concise summary of the topic or content described.',
      expansion: 'Expand on the given topic with additional details and insights.'
    };

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompts[contentType]
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.chatWithAI(messages);
  }

  async enhanceDocument(title: string, content: string): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a professional editor. Enhance the provided document by improving its structure, clarity, and overall quality while maintaining the author\'s voice and intent.'
      },
      {
        role: 'user',
        content: `Please enhance this document titled "${title}":\n\n${content}`
      }
    ];

    return this.chatWithAI(messages);
  }

  // Fallback AI suggestions when OpenAI is not available
  generateFallbackSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    
    if (text.length < 50) {
      suggestions.push("Consider expanding your content with more details and examples.");
    }
    
    if (text.split('.').length < 3) {
      suggestions.push("Try breaking down your ideas into more sentences for better readability.");
    }
    
    if (!text.includes('?') && !text.includes('!')) {
      suggestions.push("Consider adding questions or exclamations to make your writing more engaging.");
    }
    
    if ((text.match(/\bvery\b/gi)?.length || 0) > 2) {
      suggestions.push("Try replacing 'very' with stronger, more specific adjectives.");
    }
    
    if (text.split('\n\n').length < 2) {
      suggestions.push("Consider organizing your content into paragraphs for better structure.");
    }
    
    return suggestions.length > 0 ? suggestions : [
      "Keep writing! The more you practice, the better your writing becomes.",
      "Consider reading your text aloud to check for flow and clarity.",
      "Think about your audience and adjust your tone accordingly."
    ];
  }
}

export const aiService = new AIService(); 
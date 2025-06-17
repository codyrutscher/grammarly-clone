export interface Suggestion {
  id: string
  type: 'grammar' | 'spelling' | 'style' | 'readability'
  startIndex: number
  endIndex: number
  originalText: string
  suggestion: string
  explanation: string
  category: string
}

export interface Document {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

// New types for academic writing features
export type AcademicStyle = 'mla' | 'apa' | 'chicago' | 'harvard' | 'none'
export type LanguageVariant = 'us' | 'uk' | 'au' | 'ca'
export type CheckingMode = 'standard' | 'speed' | 'comprehensive'
export type WritingMode = 'academic' | 'business' | 'casual' | 'creative'

export interface WritingSettings {
  academicStyle: AcademicStyle
  languageVariant: LanguageVariant
  checkingMode: CheckingMode
  writingMode: WritingMode
  criticalErrorsOnly: boolean
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  bio: string
  profession: string
  location: string
  website: string
  preferences: UserPreferences
  writingSettings: WritingSettings
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  writingStyle: 'academic' | 'business' | 'casual' | 'creative'
  languageVariant: 'us' | 'uk' | 'au' | 'ca'
  suggestions: {
    grammar: boolean
    spelling: boolean
    style: boolean
    readability: boolean
  }
  aiAssistance: {
    enabled: boolean
    suggestionLevel: 'basic' | 'standard' | 'advanced'
    autoApply: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    shareWritingStats: boolean
  }
}

export interface VoiceNote {
  id: string;
  title: string;
  audioBlob: Blob;
  duration: number;
  transcript?: string;
  createdAt: Date;
  documentId?: string;
}

export interface PlagiarismResult {
  overallScore: number;
  matches: PlagiarismMatch[];
  sources: string[];
  isChecking: boolean;
}

export interface PlagiarismMatch {
  text: string;
  startIndex: number;
  endIndex: number;
  similarityScore: number;
  source: string;
  url?: string;
} 
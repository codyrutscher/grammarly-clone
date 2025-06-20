import { create } from 'zustand';

export type WritingMode = {
  id: string;
  name: string;
  description: string;
  rules: {
    tone: {
      formality: 'casual' | 'neutral' | 'formal';
      emotion: 'objective' | 'persuasive' | 'engaging';
    };
    style: {
      sentenceLength: 'short' | 'medium' | 'long';
      vocabulary: 'simple' | 'moderate' | 'advanced';
      allowPassiveVoice: boolean;
      technicalTerms: boolean;
    };
    structure: {
      paragraphLength: 'short' | 'medium' | 'long';
      requireTopicSentences: boolean;
      requireTransitions: boolean;
    };
    citations: {
      required: boolean;
      style: 'APA' | 'MLA' | 'Chicago' | 'none';
    };
  };
  customRules?: Record<string, any>;
};

interface WritingModeState {
  modes: WritingMode[];
  currentMode: WritingMode | null;
  setCurrentMode: (mode: WritingMode | null) => void;
  addMode: (mode: WritingMode) => void;
  updateMode: (id: string, updates: Partial<WritingMode>) => void;
  deleteMode: (id: string) => void;
}

// Predefined writing modes
const defaultModes: WritingMode[] = [
  {
    id: 'academic',
    name: 'Academic Writing',
    description: 'Formal academic style suitable for research papers and scholarly articles',
    rules: {
      tone: {
        formality: 'formal',
        emotion: 'objective'
      },
      style: {
        sentenceLength: 'medium',
        vocabulary: 'advanced',
        allowPassiveVoice: true,
        technicalTerms: true
      },
      structure: {
        paragraphLength: 'medium',
        requireTopicSentences: true,
        requireTransitions: true
      },
      citations: {
        required: true,
        style: 'APA'
      }
    }
  },
  {
    id: 'business',
    name: 'Business Professional',
    description: 'Clear and concise style for business communications',
    rules: {
      tone: {
        formality: 'formal',
        emotion: 'persuasive'
      },
      style: {
        sentenceLength: 'short',
        vocabulary: 'moderate',
        allowPassiveVoice: false,
        technicalTerms: true
      },
      structure: {
        paragraphLength: 'short',
        requireTopicSentences: true,
        requireTransitions: true
      },
      citations: {
        required: false,
        style: 'none'
      }
    }
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    description: 'Expressive style for storytelling and creative pieces',
    rules: {
      tone: {
        formality: 'casual',
        emotion: 'engaging'
      },
      style: {
        sentenceLength: 'long',
        vocabulary: 'advanced',
        allowPassiveVoice: true,
        technicalTerms: false
      },
      structure: {
        paragraphLength: 'medium',
        requireTopicSentences: false,
        requireTransitions: true
      },
      citations: {
        required: false,
        style: 'none'
      }
    }
  },
  {
    id: 'technical',
    name: 'Technical Documentation',
    description: 'Clear and precise style for technical documents',
    rules: {
      tone: {
        formality: 'neutral',
        emotion: 'objective'
      },
      style: {
        sentenceLength: 'short',
        vocabulary: 'moderate',
        allowPassiveVoice: false,
        technicalTerms: true
      },
      structure: {
        paragraphLength: 'short',
        requireTopicSentences: true,
        requireTransitions: true
      },
      citations: {
        required: false,
        style: 'none'
      }
    }
  },
  {
    id: 'blog',
    name: 'Blog Writing',
    description: 'Engaging and conversational style for blog posts',
    rules: {
      tone: {
        formality: 'casual',
        emotion: 'engaging'
      },
      style: {
        sentenceLength: 'medium',
        vocabulary: 'moderate',
        allowPassiveVoice: false,
        technicalTerms: false
      },
      structure: {
        paragraphLength: 'short',
        requireTopicSentences: true,
        requireTransitions: true
      },
      citations: {
        required: false,
        style: 'none'
      }
    }
  }
];

export const useWritingModeStore = create<WritingModeState>((set) => ({
  modes: defaultModes,
  currentMode: null,
  setCurrentMode: (mode) => set({ currentMode: mode }),
  addMode: (mode) => set((state) => ({ modes: [...state.modes, mode] })),
  updateMode: (id, updates) =>
    set((state) => ({
      modes: state.modes.map((mode) =>
        mode.id === id ? { ...mode, ...updates } : mode
      )
    })),
  deleteMode: (id) =>
    set((state) => ({
      modes: state.modes.filter((mode) => mode.id !== id),
      currentMode: state.currentMode?.id === id ? null : state.currentMode
    }))
})); 
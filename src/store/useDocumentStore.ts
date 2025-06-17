import { create } from 'zustand';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface GrammarSuggestion {
  id: string;
  type: 'grammar' | 'spelling' | 'style' | 'readability';
  start: number;
  end: number;
  original: string;
  suggestion: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  content: string;
  suggestions: GrammarSuggestion[];
  loading: boolean;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  setContent: (content: string) => void;
  setSuggestions: (suggestions: GrammarSuggestion[]) => void;
  setLoading: (loading: boolean) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  currentDocument: null,
  content: '',
  suggestions: [],
  loading: false,
  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (document) => set({ currentDocument: document }),
  setContent: (content) => set({ content }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setLoading: (loading) => set({ loading }),
  addDocument: (document) => set((state) => ({ 
    documents: [...state.documents, document] 
  })),
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ),
    currentDocument: state.currentDocument?.id === id 
      ? { ...state.currentDocument, ...updates } 
      : state.currentDocument
  })),
  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter(doc => doc.id !== id),
    currentDocument: state.currentDocument?.id === id ? null : state.currentDocument
  })),
})); 
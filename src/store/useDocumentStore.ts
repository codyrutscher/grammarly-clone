import { create } from 'zustand';
import type { DocumentPermissions, Suggestion } from '../types';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  // Shared document properties (optional)
  isShared?: boolean;
  sharedBy?: string;
  teamId?: string;
  permissions?: DocumentPermissions;
  sharedAt?: Date;
  sharedDocumentId?: string; // ID of the sharedDocuments collection entry
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  content: string;
  suggestions: Suggestion[];
  loading: boolean;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  setContent: (content: string) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
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
  setSuggestions: (suggestions) => {
    console.log('🏪 === DOCUMENT STORE: setSuggestions called ===');
    console.log('📊 New suggestions:', {
      count: suggestions.length,
      ids: suggestions.map(s => s.id),
      types: suggestions.map(s => s.type)
    });
    
    if (suggestions.length === 0) {
      console.log('❌ STORE: Suggestions being cleared! Stack trace:');
      console.trace();
    }
    
    console.log('🏪 === END DOCUMENT STORE setSuggestions ===\n');
    set({ suggestions });
  },
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
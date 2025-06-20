import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Suggestion } from '../types';

interface SuggestionFeedback {
  suggestionId: string;
  type: Suggestion['type'];
  accepted: boolean;
  timestamp: number;
}

interface SuggestionFeedbackState {
  feedbackHistory: SuggestionFeedback[];
  addFeedback: (feedback: Omit<SuggestionFeedback, 'timestamp'>) => void;
  getFeedbackStats: () => {
    acceptanceRate: { [key: string]: number };
    commonAccepted: string[];
    commonRejected: string[];
  };
  clearHistory: () => void;
}

export const useSuggestionFeedbackStore = create<SuggestionFeedbackState>()(
  persist(
    (set, get) => ({
      feedbackHistory: [],
      
      addFeedback: (feedback) => set((state) => ({
        feedbackHistory: [
          ...state.feedbackHistory,
          { ...feedback, timestamp: Date.now() }
        ].slice(-1000) // Keep last 1000 feedback items
      })),
      
      getFeedbackStats: () => {
        const { feedbackHistory } = get();
        
        // Calculate acceptance rate by suggestion type
        const acceptanceRate: { [key: string]: number } = {};
        const typeCounts: { [key: string]: number } = {};
        
        feedbackHistory.forEach((feedback) => {
          if (!typeCounts[feedback.type]) {
            typeCounts[feedback.type] = 0;
            acceptanceRate[feedback.type] = 0;
          }
          typeCounts[feedback.type]++;
          if (feedback.accepted) {
            acceptanceRate[feedback.type]++;
          }
        });
        
        Object.keys(acceptanceRate).forEach((type) => {
          acceptanceRate[type] = (acceptanceRate[type] / typeCounts[type]) * 100;
        });
        
        return {
          acceptanceRate,
          commonAccepted: [],
          commonRejected: []
        };
      },
      
      clearHistory: () => set({ feedbackHistory: [] })
    }),
    {
      name: 'suggestion-feedback-storage'
    }
  )
); 
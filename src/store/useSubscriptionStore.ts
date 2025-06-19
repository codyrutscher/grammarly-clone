import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionId: string | null;
  subscriptionType: 'free' | 'premium';
  documentsUsed: number;
  maxDocuments: number;
  setSubscription: (subscriptionId: string | null, type: 'free' | 'premium') => void;
  setDocumentCount: (count: number) => void;
  canCreateDocument: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isSubscribed: false,
      subscriptionId: null,
      subscriptionType: 'free',
      documentsUsed: 0,
      maxDocuments: 5, // Free tier limit
      
      setSubscription: (subscriptionId: string | null, type: 'free' | 'premium') => {
        set({
          isSubscribed: type === 'premium',
          subscriptionId,
          subscriptionType: type,
          maxDocuments: type === 'premium' ? 999999 : 5, // Unlimited for premium
        });
      },
      
      setDocumentCount: (count: number) => {
        set({ documentsUsed: count });
      },
      
      canCreateDocument: () => {
        const state = get();
        return state.subscriptionType === 'premium' || state.documentsUsed < state.maxDocuments;
      },
    }),
    {
      name: 'subscription-storage',
    }
  )
); 
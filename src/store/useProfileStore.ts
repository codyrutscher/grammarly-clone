import { create } from 'zustand'
import type { UserProfile, UserPreferences, WritingSettings } from '../types'

interface ProfileStore {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  
  // Actions
  setProfile: (profile: UserProfile | null) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateWritingSettings: (settings: Partial<WritingSettings>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearProfile: () => void
}

const defaultPreferences: UserPreferences = {
  writingStyle: 'business',
  languageVariant: 'us',
  suggestions: {
    grammar: true,
    spelling: true,
    style: true,
    readability: true
  },
  aiAssistance: {
    enabled: true,
    suggestionLevel: 'standard',
    autoApply: false
  },
  privacy: {
    profileVisibility: 'private',
    shareWritingStats: false
  }
}

const defaultWritingSettings: WritingSettings = {
  academicStyle: 'none',
  languageVariant: 'us',
  checkingMode: 'standard',
  writingMode: 'academic',
  criticalErrorsOnly: false
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (profile) => {
    set({ profile, error: null })
  },

  updateProfile: (updates) => {
    const currentProfile = get().profile
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          ...updates,
          updatedAt: new Date()
        }
      })
    }
  },

  updatePreferences: (preferenceUpdates) => {
    const currentProfile = get().profile
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          preferences: {
            ...currentProfile.preferences,
            ...preferenceUpdates
          },
          updatedAt: new Date()
        }
      })
    }
  },

  updateWritingSettings: (settingsUpdates) => {
    const currentProfile = get().profile
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          writingSettings: {
            ...currentProfile.writingSettings,
            ...settingsUpdates
          },
          updatedAt: new Date()
        }
      })
    }
  },

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearProfile: () => set({ profile: null, error: null })
}))

export { defaultPreferences, defaultWritingSettings } 
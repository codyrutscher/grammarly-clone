import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useProfileStore } from '../store/useProfileStore'
import { getUserProfile, createUserProfile } from '../utils/profileService'
import type { UserProfile } from '../types'
import { defaultPreferences, defaultWritingSettings } from '../store/useProfileStore'

const createDefaultProfile = (user: any): UserProfile => ({
  uid: user.uid,
  email: user.email || '',
  displayName: user.displayName || user.email?.split('@')[0] || '',
  firstName: '',
  lastName: '',
  bio: '',
  profession: '',
  location: '',
  website: '',
  preferences: defaultPreferences,
  writingSettings: defaultWritingSettings,
  createdAt: new Date(),
  updatedAt: new Date()
})

export const useProfileProvider = () => {
  const { user } = useAuthStore()
  const { setProfile, setLoading, setError } = useProfileStore()

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    const loadUserProfile = async () => {
      console.log('Loading profile for user:', user.uid)
      setLoading(true)
      setError(null)

      try {
        // First, try to load from Firebase
        console.log('Attempting to load profile from Firebase')
        const firebaseProfile = await getUserProfile(user.uid)
        
        if (firebaseProfile) {
          console.log('Loaded existing profile from Firebase:', firebaseProfile)
          setProfile(firebaseProfile)
        } else {
          console.log('No existing profile found, creating new profile')
          // No profile exists, create a new one
          const newProfile = await createUserProfile(user.uid, user.email || '', user.displayName || '')
          console.log('Created new profile:', newProfile)
          setProfile(newProfile)
        }
      } catch (error) {
        console.error('Error loading/creating profile:', error)
        setError('Failed to load profile')
        
        // Fallback: create a local profile if Firebase fails
        console.log('Creating fallback local profile')
        const fallbackProfile = createDefaultProfile(user)
        setProfile(fallbackProfile)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [user, setProfile, setLoading, setError])
} 
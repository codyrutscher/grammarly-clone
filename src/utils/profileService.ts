import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile, UserPreferences, WritingSettings } from '../types'
import { defaultPreferences, defaultWritingSettings } from '../store/useProfileStore'

export const createUserProfile = async (
  uid: string, 
  email: string, 
  displayName: string = ''
): Promise<UserProfile> => {
  const now = new Date()
  
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    firstName: '',
    lastName: '',
    bio: '',
    profession: '',
    location: '',
    website: '',
    preferences: defaultPreferences,
    writingSettings: defaultWritingSettings,
    createdAt: now,
    updatedAt: now
  }

  const profileRef = doc(db, 'profiles', uid)
  await setDoc(profileRef, {
    ...profile,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  })

  return profile
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, 'profiles', uid)
    const profileSnap = await getDoc(profileRef)
    
    if (profileSnap.exists()) {
      const data = profileSnap.data()
      return {
        ...data,
        // Ensure writing settings exist for older profiles
        writingSettings: data.writingSettings || defaultWritingSettings,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      } as UserProfile
    }
    
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export const updateUserProfile = async (
  uid: string, 
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> => {
  try {
    console.log('updateUserProfile called with:', { uid, updates })
    const profileRef = doc(db, 'profiles', uid)
    console.log('Profile reference created for path:', `profiles/${uid}`)
    
    // First check if the profile exists
    console.log('Checking if profile exists...')
    const profileSnap = await getDoc(profileRef)
    console.log('Profile existence check result:', profileSnap.exists())
    
    if (profileSnap.exists()) {
      // Profile exists, update it
      console.log('Updating existing profile...')
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      console.log('Update data:', updateData)
      
      await updateDoc(profileRef, updateData)
      console.log('Profile updated successfully in Firestore')
    } else {
      // Profile doesn't exist, create it with the updates
      console.log('Creating new profile...')
      const now = new Date()
      const newProfile: UserProfile = {
        uid,
        email: updates.email || '',
        displayName: updates.displayName || '',
        firstName: updates.firstName || '',
        lastName: updates.lastName || '',
        bio: updates.bio || '',
        profession: updates.profession || '',
        location: updates.location || '',
        website: updates.website || '',
        preferences: defaultPreferences,
        writingSettings: defaultWritingSettings,
        createdAt: now,
        updatedAt: now,
        ...updates
      }
      
      const createData = {
        ...newProfile,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
      console.log('Create data:', createData)
      
      await setDoc(profileRef, createData)
      console.log('Profile created successfully in Firestore')
    }
  } catch (error: any) {
    console.error('Error in updateUserProfile:', {
      error,
      uid,
      updates,
      errorMessage: error?.message || 'Unknown error',
      errorCode: error?.code || 'unknown'
    })
    throw error
  }
}

export const updateUserPreferences = async (
  uid: string, 
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    const profileRef = doc(db, 'profiles', uid)
    const currentProfile = await getUserProfile(uid)
    
    if (currentProfile) {
      const updatedPreferences = {
        ...currentProfile.preferences,
        ...preferences
      }
      
      await updateDoc(profileRef, {
        preferences: updatedPreferences,
        updatedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }
}

export const updateUserWritingSettings = async (
  uid: string, 
  writingSettings: Partial<WritingSettings>
): Promise<void> => {
  try {
    const profileRef = doc(db, 'profiles', uid)
    const currentProfile = await getUserProfile(uid)
    
    if (currentProfile) {
      const updatedSettings = {
        ...currentProfile.writingSettings,
        ...writingSettings
      }
      
      await updateDoc(profileRef, {
        writingSettings: updatedSettings,
        updatedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error updating user writing settings:', error)
    throw error
  }
}

export const searchUserProfiles = async (searchTerm: string): Promise<UserProfile[]> => {
  try {
    const profilesRef = collection(db, 'profiles')
    const q = query(
      profilesRef,
      where('preferences.privacy.profileVisibility', '==', 'public')
    )
    
    const querySnapshot = await getDocs(q)
    const profiles: UserProfile[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const profile = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      } as UserProfile
      
      // Simple text search (in a real app, you'd use a search service like Algolia)
      const searchFields = [
        profile.displayName,
        profile.firstName,
        profile.lastName,
        profile.profession,
        profile.bio
      ].join(' ').toLowerCase()
      
      if (searchFields.includes(searchTerm.toLowerCase())) {
        profiles.push(profile)
      }
    })
    
    return profiles
  } catch (error) {
    console.error('Error searching user profiles:', error)
    throw error
  }
} 
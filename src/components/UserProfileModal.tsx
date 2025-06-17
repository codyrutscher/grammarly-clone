import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useProfileStore } from '../store/useProfileStore'
import { updateUserProfile } from '../utils/profileService'
import { logout } from '../utils/firebaseUtils'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const { user } = useAuthStore()
  const { profile, updateProfile } = useProfileStore()
  const [saving, setSaving] = useState(false)


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    profession: '',
    location: '',
    website: ''
  })

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        profession: profile.profession || '',
        location: profile.location || '',
        website: profile.website || ''
      })
    }
  }, [profile])



  console.log('UserProfileModal state:', { 
    isOpen, 
    user: !!user, 
    profile: !!profile,
    profileData: profile ? {
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName,
      profession: profile.profession,
      location: profile.location
    } : null
  })
  
  if (!isOpen) return null
  
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <p>Please sign in to access your profile.</p>
        </div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }



  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      // Update local store first
      updateProfile(formData)
      
      // Try to save to Firebase in background
      try {
        console.log('Attempting to save profile to Firebase...', formData)
        await updateUserProfile(user.uid, formData)
        console.log('Profile saved to Firebase successfully')
        
        // Show success feedback
        const savedMessage = document.createElement('div')
        savedMessage.textContent = 'Profile saved successfully!'
        savedMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
        document.body.appendChild(savedMessage)
        setTimeout(() => document.body.removeChild(savedMessage), 2000)
        
      } catch (firebaseError: any) {
        console.error('Firebase save error details:', {
          error: firebaseError,
          message: firebaseError?.message || 'Unknown error',
          code: firebaseError?.code || 'unknown',
          uid: user.uid,
          formData
        })
        
        // Show local save feedback
        const savedMessage = document.createElement('div')
        savedMessage.textContent = 'Profile saved locally! (Firebase error - check console)'
        savedMessage.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
        document.body.appendChild(savedMessage)
        setTimeout(() => document.body.removeChild(savedMessage), 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      
      // Show error feedback
      const errorMessage = document.createElement('div')
      errorMessage.textContent = 'Failed to save profile'
      errorMessage.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      document.body.appendChild(errorMessage)
      setTimeout(() => document.body.removeChild(errorMessage), 2000)
    } finally {
      setSaving(false)
    }
  }



  const handleDeleteAccount = async () => {
    if (!user) return
    
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your documents and data.'
    )
    
    if (!confirmed) return
    
    try {
      // Here you would implement account deletion logic
      // For now, we'll just sign out the user
      console.log('Account deletion requested for user:', user.uid)
      alert('Account deletion feature will be implemented. For now, signing you out.')
             await logout()
      onClose()
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-grammarly-blue to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">User Profile</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Header - No tabs needed anymore */}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Account Created:</span> {profile.createdAt.toLocaleDateString()}</p>
                <p><span className="font-medium">Last Updated:</span> {profile.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>

            {/* Danger Zone */}
            <div className="border-t border-red-200 pt-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. This will permanently delete all your documents, preferences, and account data.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
} 
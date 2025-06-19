import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useDocumentStore } from '../store/useDocumentStore'
import { useTeamStore } from '../store/useTeamStore'
import { useDarkModeStore } from '../store/useDarkModeStore'
import {
  shareDocumentWithTeam,
  getSharedDocuments,
  unshareDocument,
  getUserTeams
} from '../utils/teamService'
import type { TeamRole, SharedDocument } from '../types'

interface DocumentSharingPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function DocumentSharingPanel({ isOpen, onClose }: DocumentSharingPanelProps) {
  const { user } = useAuthStore()
  const { currentDocument } = useDocumentStore()
  const { userTeams, currentTeam, sharedDocuments, setSharedDocuments, setUserTeams } = useTeamStore()
  const { isDarkMode } = useDarkModeStore()

  const [activeTab, setActiveTab] = useState<'share' | 'shared'>('share')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Share form - simplified without permissions
  const [shareForm, setShareForm] = useState({
    teamId: ''
  })

  useEffect(() => {
    if (isOpen && userTeams.length > 0) {
      loadSharedDocuments()
    }
  }, [isOpen, userTeams])

  // Reload shared documents when switching to the shared tab
  useEffect(() => {
    if (isOpen && activeTab === 'shared' && userTeams.length > 0) {
      loadSharedDocuments()
    }
  }, [activeTab, isOpen, userTeams])

  // Load teams if not already loaded
  useEffect(() => {
    const loadTeamsIfNeeded = async () => {
      if (isOpen && user && userTeams.length === 0) {
        try {
          console.log('Loading teams in DocumentSharingPanel for user:', user.uid)
          const teams = await getUserTeams(user.uid)
          console.log('Loaded teams in DocumentSharingPanel:', teams.length)
          setUserTeams(teams)
        } catch (error) {
          console.error('Error loading teams in DocumentSharingPanel:', error)
        }
      }
    }
    
    loadTeamsIfNeeded()
  }, [isOpen, user, userTeams.length, setUserTeams])

  const loadSharedDocuments = async () => {
    console.log('loadSharedDocuments called, userTeams:', userTeams.length)
    if (userTeams.length === 0) return

    try {
      setLoading(true)
      const allSharedDocuments: SharedDocument[] = []
      
      // Load shared documents from all teams the user belongs to
      for (const team of userTeams) {
        try {
          console.log(`Loading shared documents for team: ${team.name} (${team.id})`)
          const documents = await getSharedDocuments(team.id)
          console.log(`Found ${documents.length} shared documents for team ${team.name}`)
          allSharedDocuments.push(...documents)
        } catch (error) {
          console.error(`Error loading shared documents for team ${team.id}:`, error)
        }
      }
      
      console.log('Total shared documents loaded:', allSharedDocuments.length)
      setSharedDocuments(allSharedDocuments)
    } catch (error) {
      console.error('Error loading shared documents:', error)
      setError('Failed to load shared documents')
    } finally {
      setLoading(false)
    }
  }

  const handleShareDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !currentDocument || !shareForm.teamId) return

    try {
      setLoading(true)
      
      // All shared documents get full permissions
      const fullPermissions = {
        canView: true,
        canEdit: true,
        canComment: true,
        canShare: true
      }
      
      await shareDocumentWithTeam(
        currentDocument.id,
        shareForm.teamId,
        user.uid,
        fullPermissions
      )
      
      // Reset form
      setShareForm({ teamId: '' })
      
      // Refresh shared documents list
      await loadSharedDocuments()
      
      setActiveTab('shared')
      setError(null)
      
      // Show success message
      alert('Document shared successfully! All team members have full access.')
    } catch (error) {
      console.error('Error sharing document:', error)
      setError('Failed to share document')
    } finally {
      setLoading(false)
    }
  }

  const handleUnshareDocument = async (sharedDocId: string) => {
    if (!confirm('Are you sure you want to unshare this document?')) return

    try {
      setLoading(true)
      await unshareDocument(sharedDocId)
      
      // Remove from local state
      const updatedDocs = sharedDocuments.filter(doc => doc.id !== sharedDocId)
      setSharedDocuments(updatedDocs)
      
      setError(null)
    } catch (error) {
      console.error('Error unsharing document:', error)
      setError('Failed to unshare document')
    } finally {
      setLoading(false)
    }
  }

  const getUserRole = (): TeamRole | null => {
    if (!user || !currentTeam) return null
    const member = currentTeam.members.find(m => m.userId === user.uid)
    return member?.role || null
  }

  const canShareDocuments = (): boolean => {
    // Allow sharing if user has any teams and a document is selected
    return !!user && userTeams.length > 0 && !!currentDocument;
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`rounded-xl shadow-2xl max-w-3xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              🔗 Document Sharing
            </h2>
            <button
              onClick={onClose}
              className={`text-2xl transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ×
            </button>
          </div>

          {currentDocument && (
            <p className={`mt-2 text-sm transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Current document: <span className="font-medium">{currentDocument.title}</span>
            </p>
          )}

          {/* Tabs */}
          <div className="flex mt-4 space-x-1">
            {[
              { id: 'share', label: 'Share Document', icon: '📤' },
              { id: 'shared', label: 'Shared Documents', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
                <span className="sm:hidden">{tab.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Share Document Tab */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              {!currentDocument ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No document selected to share
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Please open a document first
                  </p>
                </div>
              ) : !canShareDocuments() ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    You don't have permission to share documents
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Contact your team admin for sharing permissions
                  </p>
                </div>
              ) : userTeams.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    You're not part of any teams
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Create or join a team to share documents
                  </p>
                </div>
              ) : (
                <form onSubmit={handleShareDocument} className="space-y-6">
                  {/* Team Selection */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Select Team *
                    </label>
                    <select
                      required
                      value={shareForm.teamId}
                      onChange={(e) => setShareForm({ teamId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">Choose a team...</option>
                      {userTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.members.length} members)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Simplified sharing info */}
                  <div className={`p-4 rounded-lg border-l-4 border-green-400 ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                      📋 Full Access Sharing
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                      All team members will have complete access to view, edit, comment, and share this document.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !shareForm.teamId}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sharing...' : 'Share Document with Full Access'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Shared Documents Tab */}
          {activeTab === 'shared' && (
            <div className="space-y-4">
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading shared documents...</p>
                </div>
              ) : userTeams.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    You're not part of any teams
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Join a team to see shared documents
                  </p>
                </div>
              ) : sharedDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No shared documents
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Share a document with your team to get started
                  </p>
                </div>
              ) : (
                sharedDocuments.map((sharedDoc) => (
                  <div
                    key={sharedDoc.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {sharedDoc.documentTitle || `Document ID: ${sharedDoc.originalDocumentId}`}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Full Access - All team members can view, edit, comment, and share
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Shared {sharedDoc.sharedAt.toLocaleDateString()} • 
                          Last modified {sharedDoc.lastModified.toLocaleDateString()}
                        </p>
                      </div>
                    
                      {(sharedDoc.sharedBy === user?.uid || getUserRole() === 'owner' || getUserRole() === 'admin') && (
                        <button
                          onClick={() => handleUnshareDocument(sharedDoc.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          Unshare
                        </button>
                      )}
                    </div>

                    {/* Simplified access indicator */}
                    <div className="mt-3">
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        🔓 Full Team Access
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
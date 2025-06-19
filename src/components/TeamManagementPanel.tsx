import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useProfileStore } from '../store/useProfileStore'
import { useTeamStore } from '../store/useTeamStore'
import { useDarkModeStore } from '../store/useDarkModeStore'
import {
  createTeam,
  getUserTeams,
  inviteUserToTeam,
  getPendingInvitations,
  acceptTeamInvitation,
  declineTeamInvitation,
  removeTeamMember,
  getTeamRolePermissions
} from '../utils/teamService'
import type { Team, TeamRole, TeamInvitation } from '../types'

interface TeamManagementPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function TeamManagementPanel({ isOpen, onClose }: TeamManagementPanelProps) {
  const { user } = useAuthStore()
  const { profile } = useProfileStore()
  const { isDarkMode } = useDarkModeStore()
  const {
    userTeams,
    currentTeam,
    pendingInvitations,
    setUserTeams,
    setCurrentTeam,
    addTeam,
    setPendingInvitations,
    updateInvitation
  } = useTeamStore()

  const [activeTab, setActiveTab] = useState<'teams' | 'invitations' | 'create'>('teams')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create team form
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    description: ''
  })

  // Invite member form
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'editor' as TeamRole,
    teamId: '',
    displayName: ''
  })
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    teamName: string;
  } | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      loadUserTeams()
      loadPendingInvitations()
    }
  }, [isOpen, user])

  const loadUserTeams = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const teams = await getUserTeams(user.uid)
      setUserTeams(teams)
    } catch (error) {
      console.error('Error loading teams:', error)
      setError('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const loadPendingInvitations = async () => {
    if (!user?.email) return
    
    try {
      const invitations = await getPendingInvitations(user.email)
      setPendingInvitations(invitations)
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !createTeamForm.name.trim()) return

    try {
      setLoading(true)
      const newTeam = await createTeam(
        user.uid,
        createTeamForm.name.trim(),
        createTeamForm.description.trim()
      )
      
      addTeam(newTeam)
      setCreateTeamForm({ name: '', description: '' })
      setActiveTab('teams')
      setError(null)
    } catch (error) {
      console.error('Error creating team:', error)
      setError('Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (teamId: string) => {
    if (!inviteForm.email || !inviteForm.role || !user) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await inviteUserToTeam(
        teamId,
        inviteForm.email,
        inviteForm.role,
        user.uid,
        inviteForm.displayName || undefined
      )

      if (result.success) {
        if (result.isExistingUser) {
          // Existing user - invitation sent
          setError('') // Clear any previous errors
          alert(`Invitation sent to ${inviteForm.email}! They will receive a notification to join the team.`)
        } else {
          // New user - account created
          const team = userTeams.find(t => t.id === teamId)
          setCreatedCredentials({
            email: inviteForm.email,
            password: result.tempPassword!,
            teamName: team?.name || 'Team'
          })
        }
        
        // Clear form
        setInviteForm({ email: '', role: 'editor', teamId: '', displayName: '' })
        
        // Refresh teams and invitations
        await loadUserTeams()
        await loadPendingInvitations()
      } else {
        setError(result.error || 'Failed to invite user')
      }
    } catch (error: any) {
      console.error('Error inviting user:', error)
      setError(error.message || 'Failed to invite user')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitation: TeamInvitation) => {
    if (!user) return

    try {
      setLoading(true)
      await acceptTeamInvitation(
        invitation.id,
        user.uid,
        user.email!,
        profile?.displayName || profile?.firstName
      )
      
      updateInvitation(invitation.id, { status: 'accepted' })
      await loadUserTeams() // Refresh teams
      setError(null)
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setError('Failed to accept invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleDeclineInvitation = async (invitation: TeamInvitation) => {
    try {
      setLoading(true)
      await declineTeamInvitation(invitation.id)
      updateInvitation(invitation.id, { status: 'declined' })
      setError(null)
    } catch (error) {
      console.error('Error declining invitation:', error)
      setError('Failed to decline invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      setLoading(true)
      await removeTeamMember(teamId, userId)
      await loadUserTeams() // Refresh teams
      setError(null)
    } catch (error) {
      console.error('Error removing member:', error)
      setError('Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const getUserRole = (team: Team): TeamRole | null => {
    if (!user) return null
    const member = team.members.find(m => m.userId === user.uid)
    return member?.role || null
  }

  const canInviteMembers = (team: Team): boolean => {
    const role = getUserRole(team)
    if (!role) return false
    const permissions = getTeamRolePermissions(role)
    return permissions.canInviteMembers
  }

  const canRemoveMembers = (team: Team): boolean => {
    const role = getUserRole(team)
    if (!role) return false
    const permissions = getTeamRolePermissions(role)
    return permissions.canRemoveMembers
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`rounded-xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-colors ${
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
              👥 Team Management
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

          {/* Tabs */}
          <div className="flex mt-4 space-x-1 overflow-x-auto">
            {[
              { id: 'teams', label: 'My Teams', icon: '👥' },
              { id: 'invitations', label: `Invitations (${pendingInvitations.length})`, icon: '📨' },
              { id: 'create', label: 'Create Team', icon: '➕' }
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

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading teams...</p>
                </div>
              ) : userTeams.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    You're not part of any teams yet
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Team
                  </button>
                </div>
              ) : (
                userTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {team.name}
                        </h3>
                        {team.description && (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {team.description}
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {team.members.length} members • Your role: {getUserRole(team)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentTeam(team)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            currentTeam?.id === team.id
                              ? 'bg-green-600 text-white'
                              : isDarkMode
                                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {currentTeam?.id === team.id ? 'Active' : 'Select'}
                        </button>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Team Members
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {team.members.map((member) => (
                          <div
                            key={member.userId}
                            className={`flex items-center justify-between p-2 rounded transition-colors ${
                              isDarkMode ? 'bg-gray-600/50' : 'bg-white'
                            }`}
                          >
                            <div>
                              <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {member.displayName || member.email}
                              </span>
                              <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                                member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                member.role === 'editor' ? 'bg-green-100 text-green-800' :
                                member.role === 'reviewer' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {member.role}
                              </span>
                            </div>
                            {canRemoveMembers(team) && member.userId !== user?.uid && (
                              <button
                                onClick={() => handleRemoveMember(team.id, member.userId)}
                                className="text-red-600 hover:text-red-800 text-sm"
                                disabled={loading}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invite Member */}
                    {canInviteMembers(team) && (
                      <div className={`mt-4 p-3 border rounded transition-colors ${
                        isDarkMode ? 'border-gray-600 bg-gray-600/30' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          Add New Team Member
                        </h5>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Display name (optional)"
                            value={inviteForm.teamId === team.id ? inviteForm.displayName : ''}
                            onChange={(e) => setInviteForm({ ...inviteForm, displayName: e.target.value, teamId: team.id })}
                            className={`w-full px-3 py-2 border rounded transition-colors ${
                              isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-300 bg-white text-gray-900'
                            }`}
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={inviteForm.teamId === team.id ? inviteForm.email : ''}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value, teamId: team.id })}
                            className={`w-full px-3 py-2 border rounded transition-colors ${
                              isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-300 bg-white text-gray-900'
                            }`}
                          />
                          <div className="flex space-x-2">
                            <select
                              value={inviteForm.teamId === team.id ? inviteForm.role : 'editor'}
                              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as TeamRole, teamId: team.id })}
                              className={`flex-1 px-3 py-2 border rounded transition-colors ${
                                isDarkMode 
                                  ? 'border-gray-600 bg-gray-700 text-white' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="reviewer">Reviewer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleInviteMember(team.id)}
                              disabled={loading || !inviteForm.email}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {loading ? '...' : 'Invite'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">
                            This will invite the user to join the team. They will receive a notification to join.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div className="space-y-4">
              {pendingInvitations.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No pending invitations
                  </p>
                </div>
              ) : (
                pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {invitation.teamName}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Role: {invitation.role}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Invited {invitation.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineInvitation(invitation)}
                          disabled={loading}
                          className={`px-4 py-2 rounded border transition-colors disabled:opacity-50 ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Create Team Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={createTeamForm.name}
                  onChange={(e) => setCreateTeamForm({ ...createTeamForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={createTeamForm.description}
                  onChange={(e) => setCreateTeamForm({ ...createTeamForm, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Optional team description"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !createTeamForm.name.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Credentials Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
          <div className={`rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ✅ Team Member Created!
            </h3>
            <div className={`space-y-3 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Account created for: {createdCredentials.email}
              </p>
              <div className="space-y-2">
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Email:
                  </label>
                  <p className={`font-mono text-sm p-2 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>
                    {createdCredentials.email}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Temporary Password:
                  </label>
                  <p className={`font-mono text-sm p-2 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>
                    {createdCredentials.password}
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-lg border-l-4 border-yellow-400 ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  📧 Important: No email was sent to the team member.
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  You must share these credentials with them manually. They can change their password after logging in.
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setCreatedCredentials(null)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
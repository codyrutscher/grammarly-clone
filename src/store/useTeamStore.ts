import { create } from 'zustand'
import type { Team, TeamMember, TeamInvitation, SharedDocument, DocumentComment } from '../types'

interface TeamState {
  // Current user's teams
  userTeams: Team[]
  currentTeam: Team | null
  
  // Team invitations
  pendingInvitations: TeamInvitation[]
  
  // Shared documents
  sharedDocuments: SharedDocument[]
  
  // Comments
  documentComments: Record<string, DocumentComment[]>
  
  // Loading states
  loading: boolean
  
  // Actions
  setUserTeams: (teams: Team[]) => void
  setCurrentTeam: (team: Team | null) => void
  addTeam: (team: Team) => void
  updateTeam: (teamId: string, updates: Partial<Team>) => void
  removeTeam: (teamId: string) => void
  
  // Team member actions
  addTeamMember: (teamId: string, member: TeamMember) => void
  updateTeamMember: (teamId: string, userId: string, updates: Partial<TeamMember>) => void
  removeTeamMember: (teamId: string, userId: string) => void
  
  // Invitation actions
  setPendingInvitations: (invitations: TeamInvitation[]) => void
  addInvitation: (invitation: TeamInvitation) => void
  updateInvitation: (invitationId: string, updates: Partial<TeamInvitation>) => void
  
  // Document sharing actions
  setSharedDocuments: (documents: SharedDocument[]) => void
  addSharedDocument: (document: SharedDocument) => void
  removeSharedDocument: (documentId: string) => void
  
  // Comment actions
  setDocumentComments: (documentId: string, comments: DocumentComment[]) => void
  addComment: (comment: DocumentComment) => void
  updateComment: (commentId: string, updates: Partial<DocumentComment>) => void
  removeComment: (commentId: string) => void
  
  // Utility actions
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  userTeams: [],
  currentTeam: null,
  pendingInvitations: [],
  sharedDocuments: [],
  documentComments: {},
  loading: false,
}

export const useTeamStore = create<TeamState>((set) => ({
  ...initialState,
  
  setUserTeams: (teams) => set({ userTeams: teams }),
  
  setCurrentTeam: (team) => set({ currentTeam: team }),
  
  addTeam: (team) => set((state) => ({
    userTeams: [...state.userTeams, team]
  })),
  
  updateTeam: (teamId, updates) => set((state) => ({
    userTeams: state.userTeams.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    ),
    currentTeam: state.currentTeam?.id === teamId 
      ? { ...state.currentTeam, ...updates } 
      : state.currentTeam
  })),
  
  removeTeam: (teamId) => set((state) => ({
    userTeams: state.userTeams.filter(team => team.id !== teamId),
    currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam
  })),
  
  addTeamMember: (teamId, member) => set((state) => ({
    userTeams: state.userTeams.map(team => 
      team.id === teamId 
        ? { ...team, members: [...team.members, member] }
        : team
    ),
    currentTeam: state.currentTeam?.id === teamId
      ? { ...state.currentTeam, members: [...state.currentTeam.members, member] }
      : state.currentTeam
  })),
  
  updateTeamMember: (teamId, userId, updates) => set((state) => ({
    userTeams: state.userTeams.map(team => 
      team.id === teamId 
        ? {
            ...team, 
            members: team.members.map(member => 
              member.userId === userId ? { ...member, ...updates } : member
            )
          }
        : team
    ),
    currentTeam: state.currentTeam?.id === teamId
      ? {
          ...state.currentTeam,
          members: state.currentTeam.members.map(member => 
            member.userId === userId ? { ...member, ...updates } : member
          )
        }
      : state.currentTeam
  })),
  
  removeTeamMember: (teamId, userId) => set((state) => ({
    userTeams: state.userTeams.map(team => 
      team.id === teamId 
        ? { ...team, members: team.members.filter(member => member.userId !== userId) }
        : team
    ),
    currentTeam: state.currentTeam?.id === teamId
      ? { ...state.currentTeam, members: state.currentTeam.members.filter(member => member.userId !== userId) }
      : state.currentTeam
  })),
  
  setPendingInvitations: (invitations) => set({ pendingInvitations: invitations }),
  
  addInvitation: (invitation) => set((state) => ({
    pendingInvitations: [...state.pendingInvitations, invitation]
  })),
  
  updateInvitation: (invitationId, updates) => set((state) => ({
    pendingInvitations: state.pendingInvitations.map(invitation => 
      invitation.id === invitationId ? { ...invitation, ...updates } : invitation
    )
  })),
  
  setSharedDocuments: (documents) => set({ sharedDocuments: documents }),
  
  addSharedDocument: (document) => set((state) => ({
    sharedDocuments: [...state.sharedDocuments, document]
  })),
  
  removeSharedDocument: (documentId) => set((state) => ({
    sharedDocuments: state.sharedDocuments.filter(doc => doc.id !== documentId)
  })),
  
  setDocumentComments: (documentId, comments) => set((state) => ({
    documentComments: {
      ...state.documentComments,
      [documentId]: comments
    }
  })),
  
  addComment: (comment) => set((state) => ({
    documentComments: {
      ...state.documentComments,
      [comment.documentId]: [
        ...(state.documentComments[comment.documentId] || []),
        comment
      ]
    }
  })),
  
  updateComment: (commentId, updates) => set((state) => {
    const newComments = { ...state.documentComments }
    
    Object.keys(newComments).forEach(documentId => {
      newComments[documentId] = newComments[documentId].map(comment =>
        comment.id === commentId ? { ...comment, ...updates } : comment
      )
    })
    
    return { documentComments: newComments }
  }),
  
  removeComment: (commentId) => set((state) => {
    const newComments = { ...state.documentComments }
    
    Object.keys(newComments).forEach(documentId => {
      newComments[documentId] = newComments[documentId].filter(comment =>
        comment.id !== commentId
      )
    })
    
    return { documentComments: newComments }
  }),
  
  setLoading: (loading) => set({ loading }),
  
  reset: () => set(initialState),
})) 
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch,
  setDoc,
  arrayUnion
} from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../firebase'
import type { 
  Team, 
  TeamMember, 
  TeamInvitation, 
  SharedDocument, 
  DocumentComment,
  TeamRole,
  DocumentPermissions
} from '../types'

// Team Management
export async function createTeam(
  ownerId: string, 
  name: string, 
  description?: string
): Promise<Team> {
  const teamData = {
    name,
    description: description || '',
    ownerId,
    members: [{
      userId: ownerId,
      email: '', // Will be filled from user profile
      role: 'owner' as TeamRole,
      joinedAt: new Date(),
      status: 'active' as const
    }],
    sharedWritingSettings: {
      academicStyle: 'none' as const,
      languageVariant: 'us' as const,
      checkingMode: 'standard' as const,
      writingMode: 'academic' as const,
      criticalErrorsOnly: false
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'teams'), teamData)
  
  return {
    id: docRef.id,
    ...teamData,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Team
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  // Get all teams and filter client-side for now (simpler for demo)
  const teamsQuery = query(collection(db, 'teams'))
  
  const snapshot = await getDocs(teamsQuery)
  const allTeams = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Team[]
  
  // Filter teams where user is a member
  return allTeams.filter(team => 
    team.members.some(member => member.userId === userId)
  )
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
  const teamRef = doc(db, 'teams', teamId)
  await updateDoc(teamRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteTeam(teamId: string): Promise<void> {
  const batch = writeBatch(db)
  
  // Delete team
  const teamRef = doc(db, 'teams', teamId)
  batch.delete(teamRef)
  
  // Delete related invitations
  const invitationsQuery = query(
    collection(db, 'teamInvitations'),
    where('teamId', '==', teamId)
  )
  const invitationsSnapshot = await getDocs(invitationsQuery)
  invitationsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })
  
  // Delete shared documents
  const sharedDocsQuery = query(
    collection(db, 'sharedDocuments'),
    where('teamId', '==', teamId)
  )
  const sharedDocsSnapshot = await getDocs(sharedDocsQuery)
  sharedDocsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })
  
  await batch.commit()
}

// Team Member Management
export async function inviteTeamMember(
  teamId: string,
  teamName: string,
  invitedBy: string,
  invitedEmail: string,
  role: TeamRole
): Promise<TeamInvitation> {
  const invitationData = {
    teamId,
    teamName,
    invitedBy,
    invitedEmail,
    role,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
  const docRef = await addDoc(collection(db, 'teamInvitations'), invitationData)
  
  return {
    id: docRef.id,
    ...invitationData,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  } as TeamInvitation
}

export async function getPendingInvitations(userEmail: string): Promise<TeamInvitation[]> {
  const invitationsQuery = query(
    collection(db, 'teamInvitations'),
    where('invitedEmail', '==', userEmail),
    where('status', '==', 'pending')
  )
  
  const snapshot = await getDocs(invitationsQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    expiresAt: doc.data().expiresAt?.toDate() || new Date()
  })) as TeamInvitation[]
}

export async function acceptTeamInvitation(
  invitationId: string,
  userId: string,
  userEmail: string,
  displayName?: string
): Promise<void> {
  const invitationRef = doc(db, 'teamInvitations', invitationId)
  const invitationDoc = await getDoc(invitationRef)
  
  if (!invitationDoc.exists()) {
    throw new Error('Invitation not found')
  }
  
  const invitation = invitationDoc.data() as TeamInvitation
  
  // Add member to team
  const teamRef = doc(db, 'teams', invitation.teamId)
  const teamDoc = await getDoc(teamRef)
  
  if (!teamDoc.exists()) {
    throw new Error('Team not found')
  }
  
  const team = teamDoc.data() as Team
  const newMember: TeamMember = {
    userId,
    email: userEmail,
    displayName,
    role: invitation.role,
    joinedAt: new Date(),
    status: 'active'
  }
  
  await updateDoc(teamRef, {
    members: [...team.members, newMember],
    updatedAt: serverTimestamp()
  })
  
  // Update invitation status
  await updateDoc(invitationRef, {
    status: 'accepted'
  })
}

export async function declineTeamInvitation(invitationId: string): Promise<void> {
  const invitationRef = doc(db, 'teamInvitations', invitationId)
  await updateDoc(invitationRef, {
    status: 'declined'
  })
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  const teamRef = doc(db, 'teams', teamId)
  const teamDoc = await getDoc(teamRef)
  
  if (!teamDoc.exists()) {
    throw new Error('Team not found')
  }
  
  const team = teamDoc.data() as Team
  const updatedMembers = team.members.filter(member => member.userId !== userId)
  
  await updateDoc(teamRef, {
    members: updatedMembers,
    updatedAt: serverTimestamp()
  })
}

// Document Sharing
export async function shareDocumentWithTeam(
  documentId: string,
  teamId: string,
  sharedBy: string,
  permissions: DocumentPermissions
): Promise<SharedDocument> {
  // First, get the original document to store its title
  const originalDocRef = doc(db, 'documents', documentId)
  const originalDocSnapshot = await getDoc(originalDocRef)
  
  if (!originalDocSnapshot.exists()) {
    throw new Error('Document not found')
  }
  
  const originalDocData = originalDocSnapshot.data()
  
  const sharedDocData = {
    originalDocumentId: documentId,
    documentTitle: originalDocData.title || 'Untitled Document',
    teamId,
    sharedBy,
    permissions,
    sharedAt: serverTimestamp(),
    lastModified: serverTimestamp()
  }
  
  const docRef = await addDoc(collection(db, 'sharedDocuments'), sharedDocData)
  
  return {
    id: docRef.id,
    ...sharedDocData,
    sharedAt: new Date(),
    lastModified: new Date()
  } as SharedDocument
}

export async function getSharedDocuments(teamId: string): Promise<SharedDocument[]> {
  console.log('getSharedDocuments: Starting query for teamId:', teamId);
  
  try {
    const sharedDocsQuery = query(
      collection(db, 'sharedDocuments'),
      where('teamId', '==', teamId),
      orderBy('lastModified', 'desc')
    )
    
    console.log('getSharedDocuments: Executing query...');
    const snapshot = await getDocs(sharedDocsQuery)
    console.log('getSharedDocuments: Query completed, found', snapshot.docs.length, 'documents');
    
    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('getSharedDocuments: Processing document:', doc.id, data);
      
      return {
        id: doc.id,
        ...data,
        sharedAt: data.sharedAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date()
      };
    }) as SharedDocument[]
    
    console.log('getSharedDocuments: Returning', documents.length, 'documents');
    return documents;
  } catch (error) {
    console.error('getSharedDocuments: Error executing query:', error);
    // If orderBy fails (missing index), try without orderBy
    try {
      console.log('getSharedDocuments: Retrying without orderBy...');
      const fallbackQuery = query(
        collection(db, 'sharedDocuments'),
        where('teamId', '==', teamId)
      )
      
      const snapshot = await getDocs(fallbackQuery)
      console.log('getSharedDocuments: Fallback query completed, found', snapshot.docs.length, 'documents');
      
      const documents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          sharedAt: data.sharedAt?.toDate() || new Date(),
          lastModified: data.lastModified?.toDate() || new Date()
        };
      }) as SharedDocument[]
      
      // Sort manually by lastModified
      documents.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
      
      console.log('getSharedDocuments: Returning', documents.length, 'documents from fallback');
      return documents;
    } catch (fallbackError) {
      console.error('getSharedDocuments: Fallback query also failed:', fallbackError);
      return [];
    }
  }
}

export async function unshareDocument(sharedDocumentId: string): Promise<void> {
  const sharedDocRef = doc(db, 'sharedDocuments', sharedDocumentId)
  await deleteDoc(sharedDocRef)
}

// Comments
export async function addDocumentComment(
  documentId: string,
  userId: string,
  userName: string,
  content: string,
  position: { startIndex: number; endIndex: number }
): Promise<DocumentComment> {
  const commentData = {
    documentId,
    userId,
    userName,
    content,
    position,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolved: false
  }
  
  const docRef = await addDoc(collection(db, 'documentComments'), commentData)
  
  return {
    id: docRef.id,
    ...commentData,
    createdAt: new Date(),
    updatedAt: new Date()
  } as DocumentComment
}

export async function getDocumentComments(documentId: string): Promise<DocumentComment[]> {
  const commentsQuery = query(
    collection(db, 'documentComments'),
    where('documentId', '==', documentId),
    orderBy('createdAt', 'asc')
  )
  
  const snapshot = await getDocs(commentsQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as DocumentComment[]
}

export async function updateDocumentComment(
  commentId: string,
  updates: Partial<DocumentComment>
): Promise<void> {
  const commentRef = doc(db, 'documentComments', commentId)
  await updateDoc(commentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteDocumentComment(commentId: string): Promise<void> {
  const commentRef = doc(db, 'documentComments', commentId)
  await deleteDoc(commentRef)
}

// Utility functions
export function getTeamRolePermissions(role: TeamRole) {
  const permissions = {
    owner: {
      canManageTeam: true,
      canInviteMembers: true,
      canRemoveMembers: true,
      canEditSettings: true,
      canShareDocuments: true,
      canEditSharedDocuments: true,
      canComment: true,
      canDeleteComments: true
    },
    admin: {
      canManageTeam: false,
      canInviteMembers: true,
      canRemoveMembers: true,
      canEditSettings: true,
      canShareDocuments: true,
      canEditSharedDocuments: true,
      canComment: true,
      canDeleteComments: true
    },
    editor: {
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canEditSettings: false,
      canShareDocuments: true,
      canEditSharedDocuments: true,
      canComment: true,
      canDeleteComments: false
    },
    reviewer: {
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canEditSettings: false,
      canShareDocuments: false,
      canEditSharedDocuments: false,
      canComment: true,
      canDeleteComments: false
    },
    viewer: {
      canManageTeam: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canEditSettings: false,
      canShareDocuments: false,
      canEditSharedDocuments: false,
      canComment: false,
      canDeleteComments: false
    }
  }
  
  return permissions[role]
}

// Create team member with credentials
export async function createTeamMemberWithCredentials(
  teamId: string,
  email: string,
  role: TeamRole,
  displayName?: string
): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
  try {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
    
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword)
    const newUser = userCredential.user
    
    // Get the team document
    const teamRef = doc(db, 'teams', teamId)
    const teamDoc = await getDoc(teamRef)
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found')
    }
    
    // Add the new user to the team
    const newMember: TeamMember = {
      userId: newUser.uid,
      email: email,
      displayName: displayName || email.split('@')[0],
      role: role,
      joinedAt: new Date(),
      status: 'active'
    }
    
    await updateDoc(teamRef, {
      members: arrayUnion(newMember)
    })
    
    // Create a welcome document for the new team member
    const welcomeDocRef = doc(collection(db, 'documents'))
    await setDoc(welcomeDocRef, {
      id: welcomeDocRef.id,
      title: `Welcome to ${teamDoc.data().name}!`,
      content: `Welcome to the team! 

Your account has been created and you can now collaborate on documents with your team members.

Team Role: ${role}
Team: ${teamDoc.data().name}

Your team administrator will provide you with your login credentials.`,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: newUser.uid,
      isShared: false,
      sharedWith: [],
      teamId: teamId
    })
    
    // Note: No email verification or password reset email is sent
    // The team owner will share credentials manually
    
    return { 
      success: true, 
      tempPassword: tempPassword 
    }
  } catch (error: any) {
    console.error('Error creating team member with credentials:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to create team member account' 
    }
  }
} 
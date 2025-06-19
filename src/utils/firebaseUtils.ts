import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification,
  updateProfile,
  type User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Document } from '../store/useDocumentStore';
import type { SharedDocument } from '../types';

// Auth functions
export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
    return { 
      user, 
      error: null,
      message: 'Account created successfully! Please check your email to verify your account before signing in.'
    };
  } catch (error) {
    return { 
      user: null, 
      error: error as Error,
      message: null
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Helper function to convert Firestore timestamp to Date
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// Document functions
export const createDocument = async (userId: string, title: string, content: string = '') => {
  try {
    const docData = {
      title,
      content,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'documents'), docData);
    return { 
      document: { 
        id: docRef.id, 
        ...docData 
      } as Document, 
      error: null 
    };
  } catch (error) {
    return { document: null, error: error as Error };
  }
};

export const updateDocument = async (documentId: string, updates: Partial<Document>) => {
  try {
    console.log('updateDocument: Attempting to update document:', documentId, updates);
    
    const docRef = doc(db, 'documents', documentId);
    
    // Check if the document exists first
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      console.error('updateDocument: Document not found:', documentId);
      return { error: new Error('Document not found') };
    }
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    console.log('updateDocument: Successfully updated document:', documentId);
    return { error: null };
  } catch (error) {
    console.error('updateDocument: Error updating document:', documentId, error);
    return { error: error as Error };
  }
};

export const deleteDocument = async (documentId: string) => {
  try {
    console.log('deleteDocument: Deleting document and cleaning up shared references:', documentId);
    
    // First, find and delete all shared document entries that reference this document
    const sharedDocsQuery = query(
      collection(db, 'sharedDocuments'),
      where('originalDocumentId', '==', documentId)
    );
    
    const sharedDocsSnapshot = await getDocs(sharedDocsQuery);
    console.log('deleteDocument: Found shared document entries to clean up:', sharedDocsSnapshot.size);
    
    // Delete all shared document entries
    const deletePromises = sharedDocsSnapshot.docs.map(sharedDoc => {
      console.log('deleteDocument: Deleting shared document entry:', sharedDoc.id);
      return deleteDoc(doc(db, 'sharedDocuments', sharedDoc.id));
    });
    
    await Promise.all(deletePromises);
    console.log('deleteDocument: Cleaned up shared document entries');
    
    // Then delete the original document
    await deleteDoc(doc(db, 'documents', documentId));
    console.log('deleteDocument: Successfully deleted document and cleaned up shared references');
    
    return { error: null };
  } catch (error) {
    console.error('deleteDocument: Error during deletion:', error);
    return { error: error as Error };
  }
};

// Get documents shared with user through teams
export const getSharedDocumentsForUser = async (userId: string) => {
  try {
    console.log('getSharedDocumentsForUser: Starting query for userId:', userId);
    
    // First, get all teams the user is a member of
    const teamsQuery = query(collection(db, 'teams'));
    const teamsSnapshot = await getDocs(teamsQuery);
    
    const userTeamIds: string[] = [];
    teamsSnapshot.forEach((teamDoc) => {
      const teamData = teamDoc.data();
      const isMember = teamData.members?.some((member: any) => member.userId === userId);
      if (isMember) {
        userTeamIds.push(teamDoc.id);
      }
    });
    
    console.log('getSharedDocumentsForUser: User is member of teams:', userTeamIds);
    
    if (userTeamIds.length === 0) {
      return { documents: [], error: null };
    }
    
    // Get all shared documents for the user's teams
    const sharedDocuments: Document[] = [];
    
    for (const teamId of userTeamIds) {
      const sharedDocsQuery = query(
        collection(db, 'sharedDocuments'),
        where('teamId', '==', teamId)
      );
      
      const sharedDocsSnapshot = await getDocs(sharedDocsQuery);
      
      for (const sharedDoc of sharedDocsSnapshot.docs) {
        const sharedDocData = sharedDoc.data() as SharedDocument;
        
        // Get the original document
        try {
          const originalDocRef = doc(db, 'documents', sharedDocData.originalDocumentId);
          const originalDocSnapshot = await getDoc(originalDocRef);
          
          if (originalDocSnapshot.exists()) {
            const originalDocData = originalDocSnapshot.data();
            
            // Create a document object with shared metadata
            const sharedDocument: Document = {
              id: originalDocSnapshot.id,
              title: `[Shared] ${originalDocData.title}`,
              content: originalDocData.content,
              userId: originalDocData.userId,
              createdAt: toDate(originalDocData.createdAt),
              updatedAt: toDate(originalDocData.updatedAt),
              // Add shared document metadata
              isShared: true,
              sharedBy: sharedDocData.sharedBy,
              teamId: teamId,
              permissions: sharedDocData.permissions,
              sharedAt: toDate(sharedDocData.sharedAt),
              sharedDocumentId: sharedDoc.id // Include the shared document ID for proper deletion
            };
            
            console.log('firebaseUtils: Created shared document:', {
              id: sharedDocument.id,
              title: sharedDocument.title,
              permissions: sharedDocument.permissions,
              canEdit: sharedDocument.permissions?.canEdit
            });
            
            sharedDocuments.push(sharedDocument);
          }
        } catch (docError) {
          console.error('Error fetching original document:', sharedDocData.originalDocumentId, docError);
        }
      }
    }
    
    console.log('getSharedDocumentsForUser: Found shared documents:', sharedDocuments.length);
    return { documents: sharedDocuments, error: null };
  } catch (error) {
    console.error('getSharedDocumentsForUser: Error:', error);
    return { documents: [], error: error as Error };
  }
};

export const getUserDocuments = async (userId: string) => {
  try {
    console.log('getUserDocuments: Starting query for userId:', userId);
    
    // Get user's own documents
    let q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
      console.log('getUserDocuments: Query with orderBy successful');
    } catch (indexError) {
      console.warn('getUserDocuments: OrderBy query failed, trying without orderBy:', indexError);
      // Fallback: query without orderBy if index doesn't exist
      q = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );
      querySnapshot = await getDocs(q);
      console.log('getUserDocuments: Query without orderBy successful');
    }
    
    const ownedDocuments: Document[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('getUserDocuments: Processing owned document:', doc.id, data);
      
      try {
        ownedDocuments.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          userId: data.userId,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          isShared: false
        } as Document);
      } catch (timestampError) {
        console.error('getUserDocuments: Error converting timestamps for doc:', doc.id, timestampError);
        // Fallback with current date if timestamp conversion fails
        ownedDocuments.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          userId: data.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false
        } as Document);
      }
    });
    
    // Get shared documents
    const sharedResult = await getSharedDocumentsForUser(userId);
    const sharedDocuments = sharedResult.documents || [];
    
    // Filter out shared documents that are owned by the same user to prevent duplicates
    const filteredSharedDocuments = sharedDocuments.filter(sharedDoc => 
      sharedDoc.userId !== userId
    );
    
    console.log('getUserDocuments: Filtered shared documents to prevent duplicates:', {
      totalShared: sharedDocuments.length,
      filteredShared: filteredSharedDocuments.length,
      removedDuplicates: sharedDocuments.length - filteredSharedDocuments.length
    });
    
    // Combine owned and filtered shared documents
    const allDocuments = [...ownedDocuments, ...filteredSharedDocuments];
    
    // Sort manually by updatedAt (or sharedAt for shared docs)
    allDocuments.sort((a, b) => {
      const aDate = a.isShared ? (a.sharedAt || a.updatedAt) : a.updatedAt;
      const bDate = b.isShared ? (b.sharedAt || b.updatedAt) : b.updatedAt;
      return bDate.getTime() - aDate.getTime();
    });
    
    console.log('getUserDocuments: Successfully loaded documents:', {
      owned: ownedDocuments.length,
      shared: filteredSharedDocuments.length,
      total: allDocuments.length
    });
    
    return { documents: allDocuments, error: null };
  } catch (error) {
    console.error('getUserDocuments: Error loading documents:', error);
    return { documents: [], error: error as Error };
  }
}; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Document } from '../store/useDocumentStore';

// Auth functions
export const signUp = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
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
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const deleteDocument = async (documentId: string) => {
  try {
    await deleteDoc(doc(db, 'documents', documentId));
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getUserDocuments = async (userId: string) => {
  try {
    console.log('getUserDocuments: Starting query for userId:', userId);
    
    // First try with orderBy - this might fail if index doesn't exist
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
    
    const documents: Document[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('getUserDocuments: Processing document:', doc.id, data);
      
      try {
        documents.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          userId: data.userId,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Document);
      } catch (timestampError) {
        console.error('getUserDocuments: Error converting timestamps for doc:', doc.id, timestampError);
        // Fallback with current date if timestamp conversion fails
        documents.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          userId: data.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Document);
      }
    });
    
    // Sort manually if we couldn't use orderBy
    documents.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    console.log('getUserDocuments: Successfully loaded documents:', documents.length);
    return { documents, error: null };
  } catch (error) {
    console.error('getUserDocuments: Error loading documents:', error);
    return { documents: [], error: error as Error };
  }
}; 
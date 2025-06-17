import { useState, useEffect } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { createDocument, getUserDocuments, updateDocument, deleteDocument } from '../utils/firebaseUtils';
import type { Document } from '../store/useDocumentStore';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  isActive: boolean;
}

function EditableTitle({ title, onSave, isActive }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(title);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(title);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className="w-full text-sm font-medium bg-white text-gray-900 border border-grammarly-blue rounded px-1 py-0.5"
        autoFocus
      />
    );
  }

  return (
    <h3 
      className={`font-medium text-sm truncate cursor-pointer ${
        isActive ? 'text-white' : 'text-gray-900'
      }`}
      onDoubleClick={handleDoubleClick}
      title="Double-click to edit"
    >
      {title}
    </h3>
  );
}

export function DocumentSidebar() {
  const { user } = useAuthStore();
  const { 
    documents, 
    currentDocument, 
    setDocuments, 
    setCurrentDocument, 
    setContent,
    addDocument,
    updateDocument: updateDocumentStore,
    deleteDocument: deleteDocumentStore
  } = useDocumentStore();
  
  const [loading, setLoading] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    
    console.log('DocumentSidebar: Loading documents for user:', user.uid);
    setLoading(true);
    try {
      const result = await getUserDocuments(user.uid);
      if (result.documents) {
        console.log('DocumentSidebar: Loaded documents:', result.documents.length);
        setDocuments(result.documents);
        
        // If no current document is selected, select the most recent one
        if (!currentDocument && result.documents.length > 0) {
          const mostRecent = result.documents[0]; // Already sorted by updatedAt desc
          console.log('DocumentSidebar: Auto-selecting most recent document:', mostRecent.id);
          setCurrentDocument(mostRecent);
          setContent(mostRecent.content);
        }
      } else {
        console.log('DocumentSidebar: No documents found');
        setDocuments([]);
      }
    } catch (error) {
      console.error('DocumentSidebar: Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!user || !newDocTitle.trim()) return;

    console.log('DocumentSidebar: Creating new document:', newDocTitle.trim());
    setLoading(true);
    try {
      const result = await createDocument(user.uid, newDocTitle.trim());
      if (result.document) {
        console.log('DocumentSidebar: Document created successfully:', result.document.id);
        addDocument(result.document);
        setCurrentDocument(result.document);
        setContent(result.document.content);
        setNewDocTitle('');
        setShowNewDocModal(false);
      } else {
        console.error('DocumentSidebar: Failed to create document:', result.error);
      }
    } catch (error) {
      console.error('DocumentSidebar: Error creating document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (document: Document) => {
    console.log('DocumentSidebar: Switching to document:', document.id);
    setCurrentDocument(document);
    setContent(document.content);
  };

  const handleDeleteDocument = async (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this document?')) return;

    console.log('DocumentSidebar: Deleting document:', documentId);
    try {
      const result = await deleteDocument(documentId);
      if (!result.error) {
        deleteDocumentStore(documentId);
        
        if (currentDocument?.id === documentId) {
          console.log('DocumentSidebar: Deleted document was current, clearing selection');
          setCurrentDocument(null);
          setContent('');
        }
        console.log('DocumentSidebar: Document deleted successfully');
      } else {
        console.error('DocumentSidebar: Failed to delete document:', result.error);
      }
    } catch (error) {
      console.error('DocumentSidebar: Error deleting document:', error);
    }
  };

  const handleUpdateTitle = async (documentId: string, newTitle: string) => {
    console.log('DocumentSidebar: Updating document title:', documentId, newTitle);
    try {
      const result = await updateDocument(documentId, { title: newTitle });
      if (!result.error) {
        updateDocumentStore(documentId, { title: newTitle });
        console.log('DocumentSidebar: Title updated successfully');
      } else {
        console.error('DocumentSidebar: Failed to update title:', result.error);
      }
    } catch (error) {
      console.error('DocumentSidebar: Error updating document title:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadDocuments}
              disabled={loading}
              className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
              title="Refresh documents"
            >
              ↻
            </button>
            <button
              onClick={() => setShowNewDocModal(true)}
              className="bg-grammarly-blue text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
            >
              New
            </button>
          </div>
        </div>
        
        {user && (
          <div className="text-sm text-gray-600">
            {user.email} • {documents.length} documents
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No documents yet.</p>
            <p className="text-sm mt-1">Create your first document to get started.</p>
          </div>
        ) : (
          <div className="p-2">
            {documents.map((document) => (
              <div
                key={document.id}
                onClick={() => handleDocumentClick(document)}
                className={`p-3 mb-2 rounded cursor-pointer transition-colors group ${
                  currentDocument?.id === document.id
                    ? 'bg-grammarly-blue text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <EditableTitle
                    title={document.title}
                    onSave={(newTitle) => handleUpdateTitle(document.id, newTitle)}
                    isActive={currentDocument?.id === document.id}
                  />
                    <p className={`text-xs mt-1 truncate ${
                      currentDocument?.id === document.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {document.content || 'Empty document'}
                    </p>
                    <div className={`text-xs mt-2 ${
                      currentDocument?.id === document.id ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatDate(document.updatedAt)}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteDocument(e, document.id)}
                    className={`ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      currentDocument?.id === document.id 
                        ? 'hover:bg-blue-600 text-white' 
                        : 'hover:bg-red-100 text-red-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Document</h3>
            
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Document title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grammarly-blue mb-4"
              autoFocus
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewDocModal(false);
                  setNewDocTitle('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={!newDocTitle.trim() || loading}
                className="flex-1 px-4 py-2 bg-grammarly-blue text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
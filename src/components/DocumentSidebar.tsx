import { useState, useEffect } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTeamStore } from '../store/useTeamStore';
import { useDarkModeStore } from '../store/useDarkModeStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { createDocument, deleteDocument, updateDocument, getUserDocuments } from '../utils/firebaseUtils';
import { unshareDocument } from '../utils/teamService';
import { UpgradePrompt } from './UpgradePrompt';
import type { Document } from '../store/useDocumentStore';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  isActive: boolean;
}

function EditableTitle({ title, onSave, isActive }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const { isDarkMode } = useDarkModeStore();

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
        className={`w-full text-sm font-medium border rounded px-1 py-0.5 transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 text-white border-blue-400' 
            : 'bg-white text-gray-900 border-grammarly-blue'
        }`}
        autoFocus
      />
    );
  }

  return (
    <h3 
      className={`font-medium text-sm truncate cursor-pointer transition-colors ${
        isActive 
          ? 'text-white' 
          : isDarkMode 
            ? 'text-gray-200' 
            : 'text-gray-900'
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
  const { currentTeam } = useTeamStore();
  const { isDarkMode } = useDarkModeStore();
  const { canCreateDocument, setDocumentCount } = useSubscriptionStore();
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
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  // Update document count whenever documents change
  useEffect(() => {
    const ownedDocuments = documents.filter(doc => !doc.isShared);
    setDocumentCount(ownedDocuments.length);
  }, [documents, setDocumentCount]);

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
    
    // Check if user can create more documents
    if (!canCreateDocument()) {
      alert('You have reached your document limit. Please upgrade to create more documents.');
      return;
    }

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
        
        // Document count will be updated automatically by the useEffect above
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
    
    // Find the document to determine if it's shared
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;
    
    const confirmMessage = document.isShared 
      ? 'Are you sure you want to remove this shared document from your view?' 
      : 'Are you sure you want to delete this document?';
    
    if (!confirm(confirmMessage)) return;

    console.log('DocumentSidebar: Processing document removal:', documentId, 'isShared:', document.isShared);
    
    try {
      if (document.isShared) {
        // For shared documents, unshare using the sharedDocumentId
        if (document.sharedDocumentId) {
          console.log('DocumentSidebar: Unsharing document with sharedDocumentId:', document.sharedDocumentId);
          console.log('DocumentSidebar: Document object:', document);
          await unshareDocument(document.sharedDocumentId);
          console.log('DocumentSidebar: Document unshared successfully');
        } else {
          console.warn('DocumentSidebar: No sharedDocumentId found for shared document, removing from local view only');
          console.warn('DocumentSidebar: Document object without sharedDocumentId:', document);
        }
        
        // Remove from local state
        deleteDocumentStore(documentId);
        
        if (currentDocument?.id === documentId) {
          console.log('DocumentSidebar: Removed shared document was current, clearing selection');
          setCurrentDocument(null);
          setContent('');
        }
        
        console.log('DocumentSidebar: Shared document removed from view');
      } else {
        // For owned documents, delete the actual document
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
      }
    } catch (error) {
      console.error('DocumentSidebar: Error processing document removal:', error);
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
    <div className={`h-full flex flex-col border-r-2 transition-colors duration-200 shadow-lg ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
    }`}>
      {/* Header */}
      <div className={`p-3 sm:p-4 border-b-2 transition-colors ${
        isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50/50'
      }`}>
        <div className={`flex items-center justify-between mb-3 p-2 rounded-lg border ${
          isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-white/50'
        }`}>
          <h2 className={`text-base sm:text-lg font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <span className="hidden sm:inline">📄 Documents</span>
            <span className="sm:hidden">📄</span>
          </h2>
          <button
            onClick={() => setShowNewDocModal(true)}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium border shadow-md ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-500' 
                : 'bg-grammarly-blue text-white hover:bg-blue-700 border-blue-400'
            }`}
            disabled={loading}
          >
            <span className="hidden sm:inline">+ New</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* Team Context - More compact on mobile */}
        {currentTeam && (
          <div className={`p-2 sm:p-3 rounded-lg transition-colors border shadow-sm ${
            isDarkMode ? 'bg-purple-900/30 border-purple-600' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-purple-600 text-sm sm:text-base">👥</span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs sm:text-sm font-medium truncate ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-800'
                }`}>
                  {currentTeam.name}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  <span className="hidden sm:inline">Team workspace</span>
                  <span className="sm:hidden">Team</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className={`p-3 sm:p-4 text-center m-2 rounded-lg border ${
            isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="hidden sm:inline">Loading documents...</span>
              <span className="sm:hidden">Loading...</span>
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className={`p-3 sm:p-4 text-center m-2 rounded-lg border ${
            isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="mb-3 sm:mb-4">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-2 sm:mb-3 border-2 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <span className="text-xl sm:text-2xl">📝</span>
              </div>
              <p className={`text-sm sm:text-base font-medium mb-1 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="hidden sm:inline">No documents yet</span>
                <span className="sm:hidden">No docs</span>
              </p>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="hidden sm:inline">Create your first document to get started</span>
                <span className="sm:hidden">Create your first doc</span>
              </p>
            </div>
            <button
              onClick={() => setShowNewDocModal(true)}
              className="bg-gradient-to-r from-grammarly-blue to-purple-600 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium border border-blue-400 shadow-md"
            >
              <span className="hidden sm:inline">📄 Create Document</span>
              <span className="sm:hidden">+ New</span>
            </button>
          </div>
        ) : (
          <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc)}
                className={`group p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 shadow-sm ${
                  currentDocument?.id === doc.id
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg border-blue-400'
                      : 'bg-gradient-to-r from-grammarly-blue to-purple-600 shadow-lg border-blue-300'
                    : isDarkMode
                      ? 'hover:bg-gray-700 border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300 bg-white/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center space-x-1 mb-1">
                      {doc.isShared && (
                        <span className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                          currentDocument?.id === doc.id 
                            ? 'bg-blue-200 text-blue-800 border-blue-300' 
                            : isDarkMode 
                              ? 'bg-purple-900/50 text-purple-300 border-purple-600' 
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                        }`}>
                          👥 Shared
                        </span>
                      )}
                      <EditableTitle
                        title={doc.isShared ? doc.title : doc.title}
                        onSave={(newTitle) => !doc.isShared && handleUpdateTitle(doc.id, newTitle)}
                        isActive={currentDocument?.id === doc.id}
                      />
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                      <p className={`text-xs transition-colors ${
                        currentDocument?.id === doc.id 
                          ? 'text-blue-100' 
                          : isDarkMode 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                      }`}>
                        <span className="hidden sm:inline">
                          {doc.isShared ? formatDate(doc.sharedAt || doc.updatedAt) : formatDate(doc.updatedAt)}
                        </span>
                        <span className="sm:hidden">
                          {(doc.isShared ? formatDate(doc.sharedAt || doc.updatedAt) : formatDate(doc.updatedAt)).split(' ')[0]}
                        </span>
                      </p>
                      {doc.content.length > 0 && (
                        <>
                          <span className={`text-xs ${
                            currentDocument?.id === doc.id 
                              ? 'text-blue-200' 
                              : isDarkMode 
                                ? 'text-gray-500' 
                                : 'text-gray-400'
                          }`}>
                            •
                          </span>
                          <p className={`text-xs transition-colors ${
                            currentDocument?.id === doc.id 
                              ? 'text-blue-100' 
                              : isDarkMode 
                                ? 'text-gray-400' 
                                : 'text-gray-500'
                          }`}>
                            <span className="hidden sm:inline">{doc.content.length} characters</span>
                            <span className="sm:hidden">{Math.ceil(doc.content.length / 100)}k</span>
                          </p>
                        </>
                      )}
                      {doc.isShared && (
                        <>
                          <span className={`text-xs ${
                            currentDocument?.id === doc.id 
                              ? 'text-blue-200' 
                              : isDarkMode 
                                ? 'text-gray-500' 
                                : 'text-gray-400'
                          }`}>
                            •
                          </span>
                          <p className={`text-xs transition-colors ${
                            currentDocument?.id === doc.id 
                              ? 'text-blue-100' 
                              : isDarkMode 
                                ? 'text-gray-400' 
                                : 'text-gray-500'
                          }`}>
                            🔓 Full Access
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteDocument(e, doc.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 border ${
                      currentDocument?.id === doc.id
                        ? 'text-red-200 hover:text-red-100 hover:bg-red-500/20 border-red-400'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20 border-gray-600'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50 border-gray-300'
                    }`}
                    title={doc.isShared ? "Remove from your documents" : "Delete document"}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl w-full max-w-md transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg sm:text-xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📄 Create New Document
              </h3>
            </div>
            
            <div className="p-4 sm:p-6">
              <input
                type="text"
                placeholder="Document title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className={`w-full p-3 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newDocTitle.trim()) {
                    handleCreateDocument();
                  }
                }}
              />
            </div>
            
            <div className={`p-4 sm:p-6 border-t flex justify-end space-x-3 transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setShowNewDocModal(false);
                  setNewDocTitle('');
                }}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={!newDocTitle.trim() || loading}
                className="bg-gradient-to-r from-grammarly-blue to-purple-600 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          // This would typically open the pricing modal
          // For now, we'll just close the prompt
        }}
        message="You've reached your 5 document limit for the free plan. Upgrade to Premium for unlimited documents!"
      />
    </div>
  );
} 
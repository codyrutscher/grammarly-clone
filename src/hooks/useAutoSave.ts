import { useEffect, useRef, useState } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { updateDocument } from '../utils/firebaseUtils';

export function useAutoSave() {
  const { currentDocument, content, updateDocument: updateDocumentStore } = useDocumentStore();
  const { user } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedContent = useRef<string>('');
  const isSaving = useRef<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  useEffect(() => {
    // Don't save if no user, no current document, or content hasn't changed
    if (!user || !currentDocument || content === lastSavedContent.current || isSaving.current) {
      return;
    }

    console.log('Auto-save: Content changed, scheduling save...', {
      documentId: currentDocument.id,
      contentLength: content.length,
      lastSavedLength: lastSavedContent.current.length
    });

    setSaveStatus('unsaved');

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (!currentDocument || isSaving.current) {
        console.log('Auto-save: Cancelled - no document or already saving');
        return;
      }

      console.log('Auto-save: Starting save...', {
        documentId: currentDocument.id,
        contentLength: content.length
      });

      isSaving.current = true;
      setSaveStatus('saving');

      try {
        const result = await updateDocument(currentDocument.id, { content });
        
        if (result.error) {
          console.error('Auto-save: Firebase update failed:', result.error);
          throw result.error;
        }

        // Update local store
        updateDocumentStore(currentDocument.id, { 
          content, 
          updatedAt: new Date() 
        });

        lastSavedContent.current = content;
        setSaveStatus('saved');
        console.log('Auto-save: Successfully saved document', {
          documentId: currentDocument.id,
          contentLength: content.length
        });

      } catch (error) {
        console.error('Auto-save: Failed to save document:', error);
        setSaveStatus('unsaved');
        // You might want to show a notification to the user here
      } finally {
        isSaving.current = false;
      }
    }, 1500); // Reduced to 1.5 seconds for faster saving

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, currentDocument, updateDocumentStore, user]);

  // Save immediately when document changes or component unmounts
  useEffect(() => {
    const saveImmediately = async () => {
      if (currentDocument && content !== lastSavedContent.current && content.trim().length > 0) {
        console.log('Auto-save: Immediate save triggered', {
          documentId: currentDocument.id,
          reason: 'document change or unmount'
        });

        setSaveStatus('saving');

        try {
          const result = await updateDocument(currentDocument.id, { content });
          if (!result.error) {
            updateDocumentStore(currentDocument.id, { 
              content, 
              updatedAt: new Date() 
            });
            lastSavedContent.current = content;
            setSaveStatus('saved');
            console.log('Auto-save: Immediate save successful');
          } else {
            console.error('Auto-save: Immediate save failed:', result.error);
            setSaveStatus('unsaved');
          }
        } catch (error) {
          console.error('Auto-save: Immediate save error:', error);
          setSaveStatus('unsaved');
        }
      }
    };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      saveImmediately();
    };
  }, [currentDocument?.id]);

  // Reset saved content when document changes
  useEffect(() => {
    if (currentDocument) {
      lastSavedContent.current = currentDocument.content;
      setSaveStatus('saved');
      console.log('Auto-save: Document changed, reset saved content reference', {
        documentId: currentDocument.id,
        contentLength: currentDocument.content.length
      });
    }
  }, [currentDocument?.id]);

  return { saveStatus };
} 
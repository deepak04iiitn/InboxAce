import { useState, useCallback, useRef, useEffect } from 'react';

interface AutoSaveOptions {
  delay?: number;
  onSave?: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions = {}
) {
  const {
    delay = 2000,
    onSave,
    onError,
    onSuccess,
  } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFirstRender = useRef(true);
  const lastSavedData = useRef<T>(data);

  // Skip auto-save on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedData.current = data;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      if (onSave && JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
        setSaveStatus({ status: 'saving' });
        
        try {
          await onSave(data);
          setSaveStatus({ 
            status: 'saved', 
            lastSaved: new Date() 
          });
          lastSavedData.current = data;
          onSuccess?.(data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Save failed';
          setSaveStatus({ 
            status: 'error', 
            error: errorMessage 
          });
          onError?.(error as Error);
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave, onSuccess, onError]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (onSave && JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
      setSaveStatus({ status: 'saving' });
      
      try {
        await onSave(data);
        setSaveStatus({ 
          status: 'saved', 
          lastSaved: new Date() 
        });
        lastSavedData.current = data;
        onSuccess?.(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Save failed';
        setSaveStatus({ 
          status: 'error', 
          error: errorMessage 
        });
        onError?.(error as Error);
      }
    }
  }, [data, onSave, onSuccess, onError]);

  // Reset save status
  const resetStatus = useCallback(() => {
    setSaveStatus({ status: 'idle' });
  }, []);

  // Check if data has unsaved changes
  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(lastSavedData.current);

  return {
    saveStatus,
    saveNow,
    resetStatus,
    hasUnsavedChanges,
  };
}

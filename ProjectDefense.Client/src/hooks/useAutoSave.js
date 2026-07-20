import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useAutoSave(saveFn, data, options = {}) {
  const { delay = 7000, version = 0 } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [conflict, setConflict] = useState(null);
  const currentVersion = useRef(version);
  
  const debouncedData = useDebounce(data, delay);

  const save = useCallback(async () => {
    if (!debouncedData) return;
    
    setIsSaving(true);
    setConflict(null);
    
    try {
      const result = await saveFn(debouncedData, currentVersion.current);
      currentVersion.current = result.newVersion;
      setLastSaved(new Date());
    } catch (error) {
      if (error.response?.status === 409) {
        setConflict(error.response.data);
      }
    } finally {
      setIsSaving(false);
    }
  }, [debouncedData, saveFn]);

  useEffect(() => {
    save();
  }, [save]);

  const resolveConflict = useCallback((resolution) => {
    // 'mine' | 'theirs' | 'merge'
    setConflict(null);
    // Handle resolution logic
  }, []);

  return { isSaving, lastSaved, conflict, resolveConflict };
}